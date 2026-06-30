import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Campaign } from './campaign.entity';

@Entity('click_events')
export class ClickEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'campaign_id', type: 'uuid' })
  campaignId: string;

  @Index()
  @Column({ name: 'promo_code', type: 'varchar', length: 20, nullable: true })
  promoCode: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  referrer: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  medium: string;

  @Column({ name: 'clicked_at', type: 'timestamptz', default: () => 'NOW()' })
  clickedAt: Date;

  @Column({ type: 'boolean', default: false })
  converted: boolean;

  @ManyToOne(() => Campaign, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;
}
