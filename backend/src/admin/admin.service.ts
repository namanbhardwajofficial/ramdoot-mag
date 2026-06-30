import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Magazine } from '../magazines/entities/magazine.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Payout } from '../earnings/entities/payout.entity';
import { AuditLog } from './entities/audit-log.entity';
import { PaymentStatus, PayoutStatus, UserRole, SubscriptionStatus } from '../common/enums';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Magazine) private magazineRepo: Repository<Magazine>,
    @InjectRepository(Campaign) private campaignRepo: Repository<Campaign>,
    @InjectRepository(UserSubscription) private userSubscriptionRepo: Repository<UserSubscription>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Payout) private payoutRepo: Repository<Payout>,
    @InjectRepository(AuditLog) private auditLogRepo: Repository<AuditLog>,
  ) {}

  /**
   * Get admin dashboard stats
   */
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      users,
      magazines,
      campaigns,
      subscriptions,
      payments,
      payouts,
      recentUsers,
      recentPayments,
    ] = await Promise.all([
      this.userRepo.count({ where: { deletedAt: IsNull() } }),
      this.magazineRepo.count({ where: { deletedAt: IsNull() } }),
      this.campaignRepo.count(),
      this.userSubscriptionRepo.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      this.paymentRepo.createQueryBuilder('p')
        .select('SUM(p.amount)', 'total')
        .where('p.status = :status', { status: PaymentStatus.SUCCESS })
        .andWhere('p.createdAt >= :startOfYear', { startOfYear })
        .getRawOne(),
      this.payoutRepo.createQueryBuilder('p')
        .select('SUM(p.amount)', 'total')
        .where('p.status = :status', { status: PayoutStatus.PENDING })
        .getRawOne(),
      this.userRepo.find({
        where: { deletedAt: IsNull() },
        order: { createdAt: 'DESC' as const },
        take: 10,
      }),
      this.paymentRepo.find({
        where: { status: PaymentStatus.SUCCESS },
        order: { createdAt: 'DESC' as const },
        take: 10,
        relations: ['user'],
      }),
    ]);

    return {
      counts: {
        totalUsers: users,
        totalMagazines: magazines,
        totalCampaigns: campaigns,
        activeSubscriptions: subscriptions,
        revenueYTD: Number(payments?.total) || 0,
        pendingPayouts: Number(payouts?.total) || 0,
      },
      recentUsers,
      recentPayments,
    };
  }

  /**
   * Get all audit logs
   */
  async getAuditLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      this.auditLogRepo.find({
        order: { createdAt: 'DESC' as const },
        skip,
        take: limit,
        relations: ['actor'],
      }),
      this.auditLogRepo.count(),
    ]);

    return {
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get admin management data (all influencers, campaigns overview)
   */
  async getInfluencerManagement() {
    const influencerRows = await this.userRepo.createQueryBuilder('u')
      .select('u.id', 'id')
      .addSelect('u.fullName', 'fullName')
      .addSelect('u.email', 'email')
      .addSelect('u.avatarUrl', 'avatarUrl')
      .addSelect('u.status', 'status')
      .addSelect('u.createdAt', 'createdAt')
      .addSelect(
        `(SELECT COUNT(*) FROM campaigns c WHERE c.influencer_id = u.id)`,
        'campaignCount',
      )
      .where('u.role = :role', { role: UserRole.INFLUENCER })
      .andWhere('u.deletedAt IS NULL')
      .orderBy('u.createdAt', 'DESC')
      .getRawMany();

    const influencers = influencerRows.map((row) => ({
      id: row.id,
      fullName: row.fullName,
      email: row.email,
      avatarUrl: row.avatarUrl,
      status: row.status,
      createdAt: row.createdAt,
      _count: { campaigns: parseInt(row.campaignCount, 10) || 0 },
    }));

    const campaignStatsRaw = await this.campaignRepo.createQueryBuilder('c')
      .select('c.status', 'status')
      .addSelect('COUNT(c.id)', 'count')
      .groupBy('c.status')
      .getRawMany();

    const campaignStats = campaignStatsRaw.map((row) => ({
      status: row.status,
      _count: { id: parseInt(row.count, 10) },
    }));

    return {
      influencers,
      campaignStats,
    };
  }
}
