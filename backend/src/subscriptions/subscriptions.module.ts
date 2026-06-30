import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionPlanMagazine } from './entities/subscription-plan-magazine.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan, SubscriptionPlanMagazine, UserSubscription, Payment, User])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
