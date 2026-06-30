import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PaymentStatus, PaymentMethod, PayoutStatus } from '../common/enums';
import { Payment } from './entities/payment.entity';
import { Payout } from '../earnings/entities/payout.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(Payout)
    private payoutRepo: Repository<Payout>,
    private configService: ConfigService,
  ) {}

  /**
   * Create a payment record after successful Razorpay payment
   */
  async createPayment(
    userId: string,
    razorpayPaymentId: string,
    amount: number,
    relatedType?: string,
    relatedId?: string,
    description?: string,
  ) {
    const payment = this.paymentRepo.create({
      userId,
      amount: amount / 100, // Convert paise to rupees
      paymentProviderId: razorpayPaymentId,
      status: PaymentStatus.SUCCESS,
      paymentMethod: PaymentMethod.UPI,
      relatedType,
      relatedId,
      description,
    });

    const saved = await this.paymentRepo.save(payment);

    this.logger.log(`Payment recorded: ${saved.id} for user ${userId}, ₹${amount / 100}`);

    return saved;
  }

  /**
   * Get all payments for a user
   */
  async getUserPayments(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.paymentRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.paymentRepo.count({ where: { userId } }),
    ]);

    return {
      data: payments,
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
   * Handle Razorpay webhook events
   */
  async handleWebhook(event: string, payload: any) {
    this.logger.log(`Razorpay webhook received: ${event}`);

    switch (event) {
      case 'payment.captured':
        await this.handlePaymentCaptured(payload);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(payload);
        break;
      case 'payout.processed':
        await this.handlePayoutProcessed(payload);
        break;
      default:
        this.logger.log(`Unhandled webhook event: ${event}`);
    }

    return { received: true };
  }

  private async handlePaymentCaptured(payload: any) {
    const payment = payload.payment || payload;
    const orderId = payment.order_id;
    const paymentId = payment.id;
    const amount = payment.amount;

    // Find pending payment by order ID and update
    await this.paymentRepo.update(
      { paymentProviderId: orderId, status: PaymentStatus.PENDING },
      {
        paymentProviderId: paymentId,
        status: PaymentStatus.SUCCESS,
      },
    );

    this.logger.log(`Payment captured: ${paymentId}`);
  }

  private async handlePaymentFailed(payload: any) {
    const payment = payload.payment || payload;
    const paymentId = payment.id;

    await this.paymentRepo.update(
      { paymentProviderId: paymentId },
      {
        status: PaymentStatus.FAILED,
        failureReason: payment.error_description || 'Payment failed',
      },
    );

    this.logger.warn(`Payment failed: ${paymentId}`);
  }

  private async handlePayoutProcessed(payload: any) {
    const payout = payload.payout || payload;
    const payoutId = payout.id;

    await this.payoutRepo.update(
      { transactionId: payoutId },
      {
        status: payout.status === 'processed' ? PayoutStatus.SUCCESS : PayoutStatus.FAILED,
        processedAt: new Date(),
      },
    );

    this.logger.log(`Payout processed: ${payoutId}`);
  }
}
