import { IsOptional, IsString, IsNumber, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMagazineDto {
  @ApiProperty({ example: 'Hindu Heritage - June 2026' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'A deep dive into ancient Hindu architecture' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: 'number', example: 49 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
