import { IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WithdrawDto {
  @ApiProperty({ example: 500, description: 'Amount in rupees' })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiProperty({ description: 'Bank account ID' })
  @IsString()
  bankAccountId!: string;
}
