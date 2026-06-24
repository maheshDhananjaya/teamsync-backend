import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { GlobalRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // 1. Create User with hashed password
  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'A user with this email address already exists.',
      );
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    const newUser = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        name: registerDto.name,
        passwordHash,
        role: registerDto.role || 'MEMBER',
      },
    });

    // Exclude password hash from return data
    const { passwordHash: _, ...result } = newUser;
    return result;
  }

  // 2. Validate user credentials and generate tokens
  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email address or password.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email address or password.');
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  // 3. Handle Token Rotation (Refresh Token validation)
  async refreshTokens(userId: string, email: string, role: GlobalRole) {
    return this.generateTokens(userId, email, role);
  }

  // Helper function to sign pair of tokens
  private async generateTokens(
    userId: string,
    email: string,
    role: GlobalRole,
  ) {
    const jwtPayload = { sub: userId, email, role };

    const accessSecret =
      this.configService.get<string>('JWT_ACCESS_SECRET') ||
      'super-secret-access-key';
    const accessExpiration = (this.configService.get<string>(
      'JWT_ACCESS_EXPIRATION',
    ) || '15m') as any;
    const refreshSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ||
      'super-secret-refresh-key';
    const refreshExpiration = (this.configService.get<string>(
      'JWT_REFRESH_EXPIRATION',
    ) || '7d') as any;

    const accessSignOptions: JwtSignOptions = {
      secret: accessSecret,
      expiresIn: accessExpiration,
    };

    const refreshSignOptions: JwtSignOptions = {
      secret: refreshSecret,
      expiresIn: refreshExpiration,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, accessSignOptions),
      this.jwtService.signAsync(jwtPayload, refreshSignOptions),
    ]);

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, role },
    };
  }
}
