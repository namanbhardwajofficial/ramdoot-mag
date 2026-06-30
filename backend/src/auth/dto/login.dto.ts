import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'SecurePass1' })
  @IsString()
  password!: string;

  @ApiPropertyOptional({ description: 'Extend session to 30 days' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
