import { IsString, IsNumber, IsOptional, IsEnum, Min, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle } from '../../common/enums';

export class CreatePlanDto {
  @ApiProperty({ example: 'Monthly Premium @ ₹49' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Access to all monthly magazines' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: BillingCycle, example: BillingCycle.MONTHLY })
  @IsEnum(BillingCycle)
  billingCycle!: BillingCycle;

  @ApiProperty({ example: 49 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ description: 'Magazine IDs to include in plan' })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  magazineIds?: string[];
}
