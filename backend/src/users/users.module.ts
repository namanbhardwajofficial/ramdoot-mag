import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, AuditLog, UserSubscription])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
