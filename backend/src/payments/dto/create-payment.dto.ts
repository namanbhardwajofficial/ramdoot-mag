import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 'order_OjK8AbC1DefGh' })
  @IsString()
  razorpayOrderId!: string;

  @ApiProperty({ example: 'pay_OjK8AbC1DefGh' })
  @IsString()
  razorpayPaymentId!: string;

  @ApiProperty({ example: 4900, description: 'Amount in paise (₹49.00)' })
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiPropertyOptional({ example: 'subscription' })
  @IsOptional()
  @IsString()
  relatedType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  relatedId?: string;

  @ApiPropertyOptional({ example: 'Monthly subscription payment' })
  @IsOptional()
  @IsString()
  description?: string;
}
