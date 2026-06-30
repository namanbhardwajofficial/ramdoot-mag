import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationType } from '../common/enums';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification) private notificationRepo: Repository<Notification>,
    private dataSource: DataSource,
  ) {}

  /**
   * Create a notification for a user
   */
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
  }) {
    const notification = await this.notificationRepo.save(
      this.notificationRepo.create({
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        link: data.link,
      }),
    );

    this.logger.log(`Notification sent to user ${data.userId}: ${data.title}`);
    return notification;
  }

  /**
   * Create notifications for multiple users (e.g., all subscribers)
   */
  async createBulk(data: {
    userIds: string[];
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
  }) {
    const notifications = data.userIds.map((userId) => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type || NotificationType.INFO,
      link: data.link,
    }));

    const result = await this.notificationRepo.insert(notifications);

    this.logger.log(`Bulk notification sent to ${data.userIds.length} users`);
    return { count: result.identifiers.length };
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.notificationRepo.count({ where: { userId } }),
      this.notificationRepo.count({ where: { userId, isRead: false } }),
    ]);

    return {
      data: notifications,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
        unreadCount,
      },
    };
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    await this.notificationRepo.update(
      { id: notificationId, userId },
      { isRead: true },
    );
    return { message: 'Notification marked as read' };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true },
    );
    return { message: 'All notifications marked as read' };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    const count = await this.notificationRepo.count({
      where: { userId, isRead: false },
    });
    return { unreadCount: count };
  }

  /**
   * Send welcome notification to a new user
   */
  async sendWelcomeNotification(userId: string, userName: string) {
    return this.create({
      userId,
      title: 'Welcome to Ramdoot!',
      message: `Namaste ${userName}! Welcome to Ramdoot Foundation. Explore our collection of authentic Hindu history and culture magazines.`,
      type: NotificationType.SUCCESS,
    });
  }

  /**
   * Notify about new magazine publication
   */
  async notifyNewMagazine(magazineTitle: string, magazineId: string) {
    const subscribers = await this.dataSource.query(
      `SELECT DISTINCT user_id as "userId" FROM user_subscriptions WHERE status = $1`,
      ['ACTIVE'],
    );

    if (subscribers.length === 0) return;

    return this.createBulk({
      userIds: subscribers.map((s: { userId: string }) => s.userId),
      title: 'New Magazine Published!',
      message: `"${magazineTitle}" has been published. Read it now!`,
      type: NotificationType.INFO,
      link: `/magazines/${magazineId}`,
    });
  }

  /**
   * Notify about payout status
   */
  async notifyPayoutStatus(userId: string, amount: number, status: string) {
    const isSuccess = status === 'SUCCESS';
    return this.create({
      userId,
      title: isSuccess ? 'Withdrawal Successful' : 'Withdrawal Failed',
      message: isSuccess
        ? `Your withdrawal of ₹${amount} has been successfully processed.`
        : `Your withdrawal of ₹${amount} has failed. Please check your bank details and try again.`,
      type: isSuccess ? NotificationType.SUCCESS : NotificationType.ERROR,
    });
  }
}
