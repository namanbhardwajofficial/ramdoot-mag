import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseSubscriptionDto {
  @ApiProperty({ description: 'Subscription Plan ID' })
  @IsUUID('4')
  planId!: string;

  @ApiProperty({ description: 'Razorpay payment ID after successful payment' })
  @IsUUID('4')
  paymentId!: string;
}
