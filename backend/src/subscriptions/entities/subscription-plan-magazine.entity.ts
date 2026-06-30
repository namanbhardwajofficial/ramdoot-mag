import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { SubscriptionPlan } from './subscription-plan.entity';
import { Magazine } from '../../magazines/entities/magazine.entity';

@Entity('subscription_plan_magazines')
export class SubscriptionPlanMagazine {
  @PrimaryColumn({ name: 'plan_id', type: 'uuid' })
  planId: string;

  @PrimaryColumn({ name: 'magazine_id', type: 'uuid' })
  magazineId: string;

  @ManyToOne(() => SubscriptionPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: SubscriptionPlan;

  @ManyToOne(() => Magazine, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'magazine_id' })
  magazine: Magazine;
}
