import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { PayoutStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { BankAccount } from './bank-account.entity';

@Entity('payouts')
export class Payout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'bank_account_id', type: 'uuid' })
  bankAccountId: string;

  @Column({ type: 'enum', enum: PayoutStatus, default: PayoutStatus.PENDING })
  status: PayoutStatus;

  @Column({ name: 'transaction_id', type: 'varchar', length: 255, nullable: true })
  transactionId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => BankAccount)
  @JoinColumn({ name: 'bank_account_id' })
  bankAccount: BankAccount;
}
