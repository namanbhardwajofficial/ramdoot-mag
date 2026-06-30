import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddBankAccountDto {
  @ApiProperty({ example: 'Arun Sharma' })
  @IsString()
  holderName!: string;

  @ApiProperty({ example: 'State Bank of India' })
  @IsString()
  bankName!: string;

  @ApiProperty({ example: '1234567890123456' })
  @IsString()
  accountNumber!: string;

  @ApiProperty({ example: 'SBIN0001234' })
  @IsString()
  ifscCode!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
