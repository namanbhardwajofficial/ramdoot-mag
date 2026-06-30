import { IsOptional, IsString, IsNumber, Min, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MagazineStatus } from '../../common/enums';

export class UpdateMagazineDto {
  @ApiPropertyOptional({ example: 'Hindu Heritage - June 2026' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ enum: MagazineStatus })
  @IsOptional()
  @IsEnum(MagazineStatus)
  status?: MagazineStatus;
}
