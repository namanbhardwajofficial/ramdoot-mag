import {
  IsString, IsDateString, IsArray, IsOptional, IsNumber, Min, Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Sale 2026' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '2026-07-01T00:00:00Z' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2026-07-31T00:00:00Z' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({
    description: 'Sharing mediums',
    example: ['instagram', 'facebook', 'whatsapp'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharingMediums?: string[];

  @ApiPropertyOptional({ example: 0.2, description: 'Commission rate (e.g. 0.20 = 20%)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  commissionRate?: number;
}
