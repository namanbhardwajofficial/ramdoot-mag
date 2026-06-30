import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanDto } from './dto/create-plan.dto';
import { SubscriptionPlan } from './entities/subscription-plan.entity';
import { SubscriptionPlanMagazine } from './entities/subscription-plan-magazine.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { Payment } from '../payments/entities/payment.entity';
import { User } from '../users/entities/user.entity';
import { BillingCycle, SubscriptionStatus, PaymentStatus } from '../common/enums';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(SubscriptionPlanMagazine)
    private readonly planMagazineRepo: Repository<SubscriptionPlanMagazine>,
    @InjectRepository(UserSubscription)
    private readonly userSubscriptionRepo: Repository<UserSubscription>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // ---- Subscription Plans ----

  async createPlan(dto: CreatePlanDto, createdById: string) {
    const { magazineIds, ...planData } = dto;

    const plan = this.planRepo.create({
      ...planData,
      createdById,
    });
    const savedPlan = await this.planRepo.save(plan);

    if (magazineIds?.length) {
      const junctionRecords = magazineIds.map(magazineId =>
        this.planMagazineRepo.create({ planId: savedPlan.id, magazineId }),
      );
      await this.planMagazineRepo.save(junctionRecords);
    }

    // Return plan with magazines loaded
    const magazines = await this.planMagazineRepo.find({
      where: { planId: savedPlan.id },
      relations: ['magazine'],
    });

    return { ...savedPlan, magazines };
  }

  async listPlans(includeInactive = false) {
    const where: any = {};
    if (!includeInactive) where.isActive = true;

    const plans = await this.planRepo.find({
      where,
      order: { price: 'ASC' },
    });

    // Load magazines and subscriber count for each plan
    const result = await Promise.all(
      plans.map(async (plan) => {
        const magazines = await this.planMagazineRepo.find({
          where: { planId: plan.id },
          relations: ['magazine'],
        });
        const subscriberCount = await this.userSubscriptionRepo.count({
          where: { planId: plan.id },
        });

        return {
          ...plan,
          magazines,
          subscriberCount,
        };
      }),
    );

    return result;
  }

  async getPlan(id: string) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');

    const magazines = await this.planMagazineRepo.find({
      where: { planId: id },
      relations: ['magazine'],
    });
    const subscriberCount = await this.userSubscriptionRepo.count({
      where: { planId: id },
    });

    return { ...plan, magazines, subscriberCount };
  }

  async updatePlan(id: string, dto: Partial<CreatePlanDto>) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');

    const { magazineIds, ...planData } = dto;

    // If magazineIds provided, replace the junction records
    if (magazineIds) {
      await this.planMagazineRepo.delete({ planId: id });
      const newRecords = magazineIds.map(magazineId =>
        this.planMagazineRepo.create({ planId: id, magazineId }),
      );
      await this.planMagazineRepo.save(newRecords);
    }

    // Update plan fields
    Object.assign(plan, planData);
    await this.planRepo.save(plan);

    // Return with magazines
    const magazines = await this.planMagazineRepo.find({
      where: { planId: id },
      relations: ['magazine'],
    });

    return { ...plan, magazines };
  }

  async togglePlanActive(id: string) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');

    plan.isActive = !plan.isActive;
    return this.planRepo.save(plan);
  }

  // ---- User Subscriptions ----

  async getUserSubscriptions(userId: string) {
    const subscriptions = await this.userSubscriptionRepo.find({
      where: { userId },
      relations: ['plan', 'payment'],
      order: { createdAt: 'DESC' },
    });

    // Enrich each subscription with plan magazines
    return Promise.all(
      subscriptions.map(async (sub) => {
        if (sub.plan) {
          const magazines = await this.planMagazineRepo.find({
            where: { planId: sub.planId },
            relations: ['magazine'],
          });
          return {
            ...sub,
            plan: { ...sub.plan, magazines },
          };
        }
        return sub;
      }),
    );
  }

  async purchaseSubscription(userId: string, planId: string, paymentId: string) {
    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    if (!plan.isActive) throw new BadRequestException('Plan is not active');

    const payment = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.SUCCESS) throw new BadRequestException('Payment not successful');

    // Calculate dates
    const startDate = new Date();
    const renewalDate = new Date(startDate);
    const endDate = new Date(startDate);

    if (plan.billingCycle === BillingCycle.MONTHLY) {
      renewalDate.setMonth(renewalDate.getMonth() + 1);
      endDate.setMonth(endDate.getMonth() + 1);
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    const subscription = this.userSubscriptionRepo.create({
      userId,
      planId,
      paymentId,
      startDate,
      renewalDate,
      endDate,
      status: SubscriptionStatus.ACTIVE,
    });
    const savedSubscription = await this.userSubscriptionRepo.save(subscription);

    // Update user total spent
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      user.totalSpent = Number(user.totalSpent) + Number(plan.price);
      await this.userRepo.save(user);
    }

    this.logger.log(`User ${userId} subscribed to plan ${planId}`);

    return this.userSubscriptionRepo.findOne({
      where: { id: savedSubscription.id },
      relations: ['plan'],
    });
  }
}
