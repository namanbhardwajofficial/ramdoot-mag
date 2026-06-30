import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { OtpPurpose } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('email_otps')
export class EmailOtp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Index()
  @Column({ type: 'varchar', length: 6 })
  otp: string;

  @Column({ type: 'enum', enum: OtpPurpose })
  purpose: OtpPurpose;

  @Column({ name: 'is_used', type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
