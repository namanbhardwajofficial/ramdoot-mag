import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { PaymentStatus, PaymentMethod } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ name: 'payment_provider_id', type: 'varchar', length: 255, nullable: true })
  paymentProviderId: string;

  @Column({ name: 'related_type', type: 'varchar', length: 50, nullable: true })
  relatedType: string;

  @Column({ name: 'related_id', type: 'uuid', nullable: true })
  relatedId: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount: number;

  @Column({ name: 'refunded_at', type: 'timestamptz', nullable: true })
  refundedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
