import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  DeleteDateColumn, OneToMany, Index,
} from 'typeorm';
import { UserRole, UserStatus } from '../../common/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName: string;

  @Index()
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'country_code', type: 'varchar', length: 5, nullable: true })
  countryCode: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ name: 'is_email_verified', type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'avatar_url', type: 'varchar', length: 500, nullable: true })
  avatarUrl: string;

  @Index()
  @Column({ name: 'referral_code', type: 'varchar', length: 20, unique: true, nullable: true })
  referralCode: string;

  @Column({ name: 'total_spent', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalSpent: number;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'two_factor_secret', type: 'varchar', length: 255, nullable: true })
  twoFactorSecret: string;

  @Column({ name: 'is_two_factor_enabled', type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
