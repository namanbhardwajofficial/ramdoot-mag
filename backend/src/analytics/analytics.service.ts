import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, MoreThanOrEqual, IsNull } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Magazine } from '../magazines/entities/magazine.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { ClickEvent } from '../campaigns/entities/click-event.entity';
import { Conversion } from '../campaigns/entities/conversion.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Payout } from '../earnings/entities/payout.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { PaymentStatus, PayoutStatus, CampaignStatus, SubscriptionStatus } from '../common/enums';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private dataSource: DataSource,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Magazine) private magazineRepo: Repository<Magazine>,
    @InjectRepository(Campaign) private campaignRepo: Repository<Campaign>,
    @InjectRepository(ClickEvent) private clickEventRepo: Repository<ClickEvent>,
    @InjectRepository(Conversion) private conversionRepo: Repository<Conversion>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Payout) private payoutRepo: Repository<Payout>,
    @InjectRepository(UserSubscription) private userSubscriptionRepo: Repository<UserSubscription>,
  ) {}

  /**
   * Get dashboard analytics for admin
   */
  async getAdminDashboard() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      newUsersThisMonth,
      totalMagazines,
      activeCampaigns,
      totalRevenue,
      revenueThisMonth,
      pendingPayouts,
      subscriptionsActive,
    ] = await Promise.all([
      this.userRepo.count({ where: { deletedAt: IsNull() } }),
      this.userRepo.count({
        where: { createdAt: MoreThanOrEqual(startOfMonth), deletedAt: IsNull() },
      }),
      this.magazineRepo.count({ where: { deletedAt: IsNull() } }),
      this.campaignRepo.count({ where: { status: CampaignStatus.ACTIVE } }),
      this.paymentRepo.createQueryBuilder('p')
        .select('SUM(p.amount)', 'total')
        .where('p.status = :status', { status: PaymentStatus.SUCCESS })
        .getRawOne(),
      this.paymentRepo.createQueryBuilder('p')
        .select('SUM(p.amount)', 'total')
        .where('p.status = :status', { status: PaymentStatus.SUCCESS })
        .andWhere('p.createdAt >= :startOfMonth', { startOfMonth })
        .getRawOne(),
      this.payoutRepo.createQueryBuilder('p')
        .select('SUM(p.amount)', 'total')
        .where('p.status = :status', { status: PayoutStatus.PENDING })
        .getRawOne(),
      this.userSubscriptionRepo.count({ where: { status: SubscriptionStatus.ACTIVE } }),
    ]);

    return {
      overview: {
        totalUsers,
        newUsersThisMonth,
        totalMagazines,
        activeCampaigns,
        subscriptionsActive,
      },
      revenue: {
        total: Number(totalRevenue?.total) || 0,
        thisMonth: Number(revenueThisMonth?.total) || 0,
        pendingPayouts: Number(pendingPayouts?.total) || 0,
      },
    };
  }

  /**
   * Track a click event from promo code
   */
  async trackClick(promoCode: string, data: {
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
    medium?: string;
  }) {
    const campaign = await this.campaignRepo.findOne({
      where: { promoCode },
    });

    if (!campaign) {
      this.logger.warn(`Click tracked for unknown promo code: ${promoCode}`);
      return { valid: false };
    }

    await this.clickEventRepo.save(
      this.clickEventRepo.create({
        campaignId: campaign.id,
        promoCode,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        referrer: data.referrer,
        medium: data.medium,
      }),
    );

    return { valid: true, campaignId: campaign.id };
  }

  /**
   * Record a conversion (purchase via promo code)
   */
  async recordConversion(data: {
    campaignId: string;
    clickEventId?: string;
    userId: string;
    amount: number;
    itemType?: string;
    itemId?: string;
  }) {
    const campaign = await this.campaignRepo.findOne({
      where: { id: data.campaignId },
    });

    if (!campaign) {
      this.logger.warn(`Conversion for unknown campaign: ${data.campaignId}`);
      return null;
    }

    const commissionEarned = Number(data.amount) * Number(campaign.commissionRate);

    const conversion = await this.conversionRepo.save(
      this.conversionRepo.create({
        campaignId: data.campaignId,
        clickEventId: data.clickEventId,
        userId: data.userId,
        amount: data.amount,
        itemType: data.itemType,
        itemId: data.itemId,
        commissionEarned,
      }),
    );

    // Mark click event as converted
    if (data.clickEventId) {
      await this.clickEventRepo.update(data.clickEventId, { converted: true });
    }

    this.logger.log(
      `Conversion recorded: ${conversion.id}, commission: ₹${commissionEarned}`,
    );

    return conversion;
  }

  /**
   * Get aggregated stats for a campaign
   */
  async getCampaignAggregates(campaignId: string) {
    const [clicksByDay, clicksByMedium, conversionsByDay, topReferrers] =
      await Promise.all([
        this.dataSource.query(
          `SELECT DATE(clicked_at) as date, COUNT(*)::int as count
           FROM click_events
           WHERE campaign_id = $1
           GROUP BY DATE(clicked_at)
           ORDER BY date DESC
           LIMIT 30`,
          [campaignId],
        ),
        this.clickEventRepo.createQueryBuilder('ce')
          .select('ce.medium', 'medium')
          .addSelect('COUNT(ce.id)', 'count')
          .where('ce.campaignId = :campaignId', { campaignId })
          .groupBy('ce.medium')
          .getRawMany()
          .then((results) =>
            results.map((r) => ({
              medium: r.medium,
              _count: { id: parseInt(r.count, 10) },
            })),
          ),
        this.dataSource.query(
          `SELECT DATE(created_at) as date, COUNT(*)::int as count,
                  SUM(commission_earned) as commission
           FROM conversions
           WHERE campaign_id = $1
           GROUP BY DATE(created_at)
           ORDER BY date DESC
           LIMIT 30`,
          [campaignId],
        ),
        this.clickEventRepo.createQueryBuilder('ce')
          .select('ce.referrer', 'referrer')
          .addSelect('COUNT(ce.id)', 'count')
          .where('ce.campaignId = :campaignId', { campaignId })
          .andWhere('ce.referrer IS NOT NULL')
          .groupBy('ce.referrer')
          .orderBy('count', 'DESC')
          .limit(10)
          .getRawMany()
          .then((results) =>
            results.map((r) => ({
              referrer: r.referrer,
              _count: { id: parseInt(r.count, 10) },
            })),
          ),
      ]);

    return {
      clicksByDay,
      clicksByMedium,
      conversionsByDay,
      topReferrers,
    };
  }
}
