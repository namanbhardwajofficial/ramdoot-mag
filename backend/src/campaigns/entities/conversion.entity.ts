import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Campaign } from './campaign.entity';
import { ClickEvent } from './click-event.entity';
import { Magazine } from '../../magazines/entities/magazine.entity';

@Entity('conversions')
export class Conversion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'campaign_id', type: 'uuid', nullable: true })
  campaignId: string;

  @Column({ name: 'click_event_id', type: 'uuid', nullable: true })
  clickEventId: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ name: 'item_type', type: 'varchar', length: 50, nullable: true })
  itemType: string;

  @Column({ name: 'item_id', type: 'uuid', nullable: true })
  itemId: string;

  @Column({ name: 'commission_earned', type: 'decimal', precision: 10, scale: 2 })
  commissionEarned: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Campaign)
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @ManyToOne(() => ClickEvent)
  @JoinColumn({ name: 'click_event_id' })
  clickEvent: ClickEvent;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Magazine)
  @JoinColumn({ name: 'item_id' })
  magazine: Magazine;
}
