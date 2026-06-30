import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { Magazine } from '../magazines/entities/magazine.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Payout } from '../earnings/entities/payout.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Magazine, Campaign, UserSubscription, Payment, Payout, AuditLog])],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
