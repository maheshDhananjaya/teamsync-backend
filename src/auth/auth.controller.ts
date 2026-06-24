import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@ApiTags('Authentication Module')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 21, description: 'User successfully created.' })
  @ApiResponse({ status: 400, description: 'Validation errors.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user and return a JWT access/refresh token pair',
  })
  @ApiResponse({ status: 200, description: 'Authentication successful.' })
  @ApiResponse({ status: 401, description: 'Invalid email or password.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Rotate stale access tokens using an active refresh token',
  })
  @ApiResponse({ status: 200, description: 'Token rotation successful.' })
  @ApiResponse({ status: 401, description: 'Stale or invalid refresh token.' })
  refresh(@Req() req) {
    const user = req.user as any;
    return this.authService.refreshTokens(user.id, user.email, user.role);
  }
}
