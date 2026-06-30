import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { SubscriptionStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';
import { SubscriptionPlan } from './subscription-plan.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index()
  @Column({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'renewal_date', type: 'timestamptz', nullable: true })
  renewalDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ name: 'payment_id', type: 'uuid', unique: true, nullable: true })
  paymentId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => SubscriptionPlan)
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @ManyToOne(() => Payment)
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;
}
