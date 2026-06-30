import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../../common/enums';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus, example: UserStatus.SUSPENDED })
  @IsEnum(UserStatus)
  status!: UserStatus;

  @ApiPropertyOptional({ example: 'Violation of terms of service' })
  @IsOptional()
  @IsString()
  reason?: string;
}
