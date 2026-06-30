import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { ClickEvent } from '../campaigns/entities/click-event.entity';
import { Conversion } from '../campaigns/entities/conversion.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Payout } from '../earnings/entities/payout.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { User } from '../users/entities/user.entity';
import { Magazine } from '../magazines/entities/magazine.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClickEvent, Conversion, Campaign, Payment, Payout, UserSubscription, User, Magazine])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
