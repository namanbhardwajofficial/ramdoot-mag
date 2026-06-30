import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, ILike, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { User } from './entities/user.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { UserSubscription } from '../subscriptions/entities/user-subscription.entity';
import { Notification } from '../notifications/entities/notification.entity';
import { Payment } from '../payments/entities/payment.entity';
import { DeviceSession } from './entities/device-session.entity';
import { Campaign } from '../campaigns/entities/campaign.entity';
import { ClickEvent } from '../campaigns/entities/click-event.entity';
import { Conversion } from '../campaigns/entities/conversion.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserRole } from '../common/enums';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
    @InjectRepository(UserSubscription)
    private userSubscriptionRepo: Repository<UserSubscription>,
    private dataSource: DataSource,
  ) {}

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const subscriptionCount = await this.userSubscriptionRepo.count({
      where: { userId },
    });

    const notificationRepo = this.dataSource.getRepository(Notification);
    const unreadNotificationCount = await notificationRepo.count({
      where: { userId, isRead: false },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    return {
      ...safeUser,
      _count: {
        userSubscriptions: subscriptionCount,
        notifications: unreadNotificationCount,
      },
    };
  }

  /**
   * Update current user profile
   */
  async updateProfile(userId: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Check email uniqueness if changing
    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing) throw new ForbiddenException('Email already in use');
    }

    await this.userRepo.update(userId, dto as Partial<User>);

    const updated = await this.userRepo.findOne({ where: { id: userId } });
    if (!updated) throw new NotFoundException('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, twoFactorSecret, ...safeUser } = updated;
    return safeUser;
  }

  /**
   * Admin: List all users with filters and pagination
   */
  async listUsers(query: UserQueryDto) {
    const { search, role, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const baseWhere: FindOptionsWhere<User> = {};
    if (role) baseWhere.role = role as any;
    if (status) baseWhere.status = status as any;

    let where: FindOptionsWhere<User> | FindOptionsWhere<User>[];

    if (search) {
      where = [
        { ...baseWhere, fullName: ILike(`%${search}%`) },
        { ...baseWhere, email: ILike(`%${search}%`) },
        { ...baseWhere, phone: ILike(`%${search}%`) },
      ];
    } else {
      where = { ...baseWhere };
    }

    const [users, total] = await Promise.all([
      this.userRepo.find({
        where,
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
      }),
      this.userRepo.count({ where }),
    ]);

    // Enrich users with count data via separate queries
    const campaignRepo = this.dataSource.getRepository(Campaign);
    const paymentRepo = this.dataSource.getRepository(Payment);

    const data = await Promise.all(
      users.map(async (user) => {
        const subscriptionCount = await this.userSubscriptionRepo.count({
          where: { userId: user.id },
        });
        const campaignCount = await campaignRepo.count({
          where: { influencerId: user.id },
        });
        const paymentCount = await paymentRepo.count({
          where: { userId: user.id },
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { passwordHash, twoFactorSecret, ...safeUser } = user;
        return {
          ...safeUser,
          _count: {
            userSubscriptions: subscriptionCount,
            campaigns: campaignCount,
            payments: paymentCount,
          },
        };
      }),
    );

    return {
      data,
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
   * Admin: Get user by ID with full details
   */
  async getUserById(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Fetch related data in parallel
    const [userSubscriptions, payments, deviceSessions, notifications, campaigns] = await Promise.all([
      this.userSubscriptionRepo.find({
        where: { userId: id },
        relations: ['plan', 'payment'],
        order: { createdAt: 'DESC' },
      }),
      this.dataSource.getRepository(Payment).find({
        where: { userId: id },
        order: { createdAt: 'DESC' },
        take: 20,
      }),
      this.dataSource.getRepository(DeviceSession).find({
        where: { userId: id, isActive: true },
        order: { lastActiveAt: 'DESC' },
      }),
      this.dataSource.getRepository(Notification).find({
        where: { userId: id },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
      this.dataSource.getRepository(Campaign).find({
        where: { influencerId: id },
      }),
    ]);

    // Enrich campaigns with click and conversion counts
    const clickEventRepo = this.dataSource.getRepository(ClickEvent);
    const conversionRepo = this.dataSource.getRepository(Conversion);

    const campaignsWithCounts = await Promise.all(
      campaigns.map(async (campaign) => {
        const [clickCount, conversionCount] = await Promise.all([
          clickEventRepo.count({ where: { campaignId: campaign.id } }),
          conversionRepo.count({ where: { campaignId: campaign.id } }),
        ]);
        return {
          ...campaign,
          _count: { clickEvents: clickCount, conversions: conversionCount },
        };
      }),
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    return {
      ...safeUser,
      userSubscriptions,
      payments,
      deviceSessions,
      notifications,
      campaigns: campaignsWithCounts,
    };
  }

  /**
   * Admin: Create a new user (admin invite)
   */
  async createUser(dto: CreateUserDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ForbiddenException('Email already registered');

    // Generate a temporary password
    const tempPassword = nanoid(12);
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(tempPassword, salt);
    const referralCode = 'RMD' + nanoid(8).toUpperCase();

    const user = await (this.userRepo.save({
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone ?? undefined,
      passwordHash,
      role: dto.role || UserRole.USER,
      referralCode,
    }) as Promise<User>);

    this.logger.log(`Admin created user ${user.id} with email ${dto.email}`);

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      tempPassword, // Should be sent via email in production
    };
  }

  /**
   * Admin: Update user status (suspend/block/activate)
   */
  async updateUserStatus(id: string, dto: UpdateUserStatusDto, actorId: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const oldStatus = user.status;

    await this.userRepo.update(id, { status: dto.status as any });

    // Create audit log
    await this.auditLogRepo.save({
      actorId,
      action: 'UPDATE_USER_STATUS',
      entity: 'user',
      entityId: id,
      oldValue: { status: oldStatus },
      newValue: { status: dto.status, reason: dto.reason },
    });

    this.logger.log(`User ${id} status changed from ${oldStatus} to ${dto.status} by admin ${actorId}`);

    const updated = await this.userRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('User not found');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, twoFactorSecret, ...safeUser } = updated;
    return safeUser;
  }
}
