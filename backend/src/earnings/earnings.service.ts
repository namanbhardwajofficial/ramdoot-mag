import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { AddBankAccountDto } from './dto/add-bank-account.dto';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Conversion } from '../campaigns/entities/conversion.entity';
import { BankAccount } from './entities/bank-account.entity';
import { Payout } from './entities/payout.entity';
import { PayoutStatus } from '../common/enums';

@Injectable()
export class EarningsService {
  private readonly logger = new Logger(EarningsService.name);
  private readonly ALGORITHM = 'aes-256-cbc';

  constructor(
    @InjectRepository(Conversion) private conversionRepo: Repository<Conversion>,
    @InjectRepository(BankAccount) private bankAccountRepo: Repository<BankAccount>,
    @InjectRepository(Payout) private payoutRepo: Repository<Payout>,
    private configService: ConfigService,
  ) {}

  /**
   * Encrypt sensitive data (bank account number)
   */
  private encrypt(text: string): string {
    const key = Buffer.from(this.configService.get<string>('ENCRYPTION_KEY') || '', 'hex');
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Get earnings overview for an influencer
   */
  async getEarnings(userId: string) {
    const conversions = await this.conversionRepo.find({
      where: { campaign: { influencerId: userId } },
      relations: ['campaign'],
      order: { createdAt: 'DESC' },
    });

    const totalEarnings = conversions.reduce(
      (sum, c) => sum + Number(c.commissionEarned), 0,
    );

    const pendingPayoutsResult = await this.payoutRepo.createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.userId = :userId', { userId })
      .andWhere('p.status = :status', { status: PayoutStatus.PENDING })
      .getRawOne();

    const completedPayoutsResult = await this.payoutRepo.createQueryBuilder('p')
      .select('SUM(p.amount)', 'total')
      .where('p.userId = :userId', { userId })
      .andWhere('p.status = :status', { status: PayoutStatus.SUCCESS })
      .getRawOne();

    const bankAccounts = await this.bankAccountRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const pendingAmount = Number(pendingPayoutsResult?.total) || 0;
    const completedAmount = Number(completedPayoutsResult?.total) || 0;

    return {
      totalEarnings,
      pendingPayouts: pendingAmount,
      completedPayouts: completedAmount,
      availableBalance: totalEarnings - pendingAmount - completedAmount,
      totalConversions: conversions.length,
      bankAccounts: bankAccounts.map((a) => ({
        id: a.id,
        bankName: a.bankName,
        holderName: a.holderName,
        isVerified: a.isVerified,
        isDefault: a.isDefault,
        ifscCode: a.ifscCode,
      })),
      recentConversions: conversions.slice(0, 10).map((c) => ({
        ...c,
        campaign: {
          id: c.campaign?.id,
          name: c.campaign?.name,
          promoCode: c.campaign?.promoCode,
        },
      })),
    };
  }

  /**
   * Add a bank account
   */
  async addBankAccount(userId: string, dto: AddBankAccountDto) {
    const encryptedAccountNumber = this.encrypt(dto.accountNumber);

    const account = await this.bankAccountRepo.save(
      this.bankAccountRepo.create({
        userId,
        holderName: dto.holderName,
        bankName: dto.bankName,
        accountNumber: encryptedAccountNumber,
        ifscCode: dto.ifscCode,
        isDefault: dto.isDefault || false,
      }),
    );

    // If this is set as default, unset other defaults
    if (dto.isDefault) {
      await this.bankAccountRepo.update(
        { userId, id: Not(account.id) },
        { isDefault: false },
      );
    }

    return {
      id: account.id,
      bankName: account.bankName,
      holderName: account.holderName,
      ifscCode: account.ifscCode,
      isVerified: account.isVerified,
      isDefault: account.isDefault,
    };
  }

  /**
   * Get user's bank accounts
   */
  async getBankAccounts(userId: string) {
    const accounts = await this.bankAccountRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    return accounts.map((a) => ({
      id: a.id,
      bankName: a.bankName,
      holderName: a.holderName,
      ifscCode: a.ifscCode,
      isVerified: a.isVerified,
      isDefault: a.isDefault,
      createdAt: a.createdAt,
    }));
  }

  /**
   * Request a withdrawal
   */
  async requestWithdrawal(userId: string, amount: number, bankAccountId: string) {
    const bankAccount = await this.bankAccountRepo.findOne({
      where: { id: bankAccountId },
    });

    if (!bankAccount || bankAccount.userId !== userId) {
      throw new NotFoundException('Bank account not found');
    }

    if (!bankAccount.isVerified) {
      throw new BadRequestException('Bank account is not verified');
    }

    // Check available balance
    const earnings = await this.getEarnings(userId);
    if (amount > earnings.availableBalance) {
      throw new BadRequestException('Insufficient balance');
    }

    const payout = await this.payoutRepo.save(
      this.payoutRepo.create({
        userId,
        amount,
        bankAccountId,
        status: PayoutStatus.PENDING,
      }),
    );

    this.logger.log(`Withdrawal requested: ${payout.id} for user ${userId}, ₹${amount}`);

    // TODO: Trigger Razorpay payout via queue job
    this.logger.log(`Payout ${payout.id} queued for processing`);

    return payout;
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(userId: string) {
    const payouts = await this.payoutRepo.find({
      where: { userId },
      relations: ['bankAccount'],
      order: { createdAt: 'DESC' },
    });

    return payouts.map((p) => ({
      ...p,
      bankAccount: p.bankAccount
        ? { bankName: p.bankAccount.bankName, ifscCode: p.bankAccount.ifscCode }
        : undefined,
    }));
  }
}
