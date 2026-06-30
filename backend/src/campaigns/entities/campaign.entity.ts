import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn, Index, OneToMany,
} from 'typeorm';
import { CampaignStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Index()
  @Column({ name: 'influencer_id', type: 'uuid' })
  influencerId: string;

  @Index()
  @Column({ name: 'promo_code', type: 'varchar', length: 20, unique: true })
  promoCode: string;

  @Column({ name: 'start_date', type: 'timestamptz' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz' })
  endDate: Date;

  @Column({ name: 'sharing_mediums', type: 'jsonb', default: [] })
  sharingMediums: string[];

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.ACTIVE })
  status: CampaignStatus;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 4 })
  commissionRate: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'influencer_id' })
  influencer: User;
}
