import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PublishMagazineDto {
  @ApiPropertyOptional({ description: 'Notify paid subscribers about this publication' })
  @IsOptional()
  @IsBoolean()
  notifySubscribers?: boolean;
}
