import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GlobalRole } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({
    example: 'mahesh@teamsync.local',
    description: 'The unique email address of the user',
  })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (minimum 6 characters)',
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @ApiProperty({
    example: 'Mahesh Kulathunga',
    description: 'The display name of the user',
  })
  @IsString()
  @IsNotEmpty({ message: 'Name cannot be empty' })
  name: string;

  @ApiProperty({
    enum: GlobalRole,
    default: GlobalRole.MEMBER,
    required: false,
  })
  @IsEnum(GlobalRole)
  @IsOptional()
  role?: GlobalRole;
}
