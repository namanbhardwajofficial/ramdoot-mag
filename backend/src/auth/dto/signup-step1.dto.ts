// ==========================================
// RAMDOOT Foundation - Signup Step 1 DTO
// ==========================================

import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignupStep1Dto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Full name of the user',
    example: 'Arun Sharma',
  })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiPropertyOptional({
    description: 'Phone number without country code',
    example: '9876543210',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Country code',
    example: '+91',
  })
  @IsOptional()
  @IsString()
  countryCode?: string;
}
