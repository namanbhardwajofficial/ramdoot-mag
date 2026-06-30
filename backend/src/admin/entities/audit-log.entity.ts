import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'actor_id', type: 'uuid' })
  actorId: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Index()
  @Column({ type: 'varchar', length: 100 })
  entity: string;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId: string;

  @Column({ name: 'old_value', type: 'jsonb', nullable: true })
  oldValue: Record<string, any>;

  @Column({ name: 'new_value', type: 'jsonb', nullable: true })
  newValue: Record<string, any>;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actor_id' })
  actor: User;
}
