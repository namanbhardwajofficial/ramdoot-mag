import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MagazineStatus } from '../../common/enums';
import { Type } from 'class-transformer';

export class MagazineQueryDto {
  @ApiPropertyOptional({ enum: MagazineStatus })
  @IsOptional()
  @IsEnum(MagazineStatus)
  status?: MagazineStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 12;
}
