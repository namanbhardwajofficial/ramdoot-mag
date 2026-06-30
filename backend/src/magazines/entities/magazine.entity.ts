import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  DeleteDateColumn, ManyToOne, JoinColumn, Index, OneToMany,
} from 'typeorm';
import { MagazineStatus } from '../../common/enums';
import { User } from '../../users/entities/user.entity';

@Entity('magazines')
export class Magazine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'short_description', type: 'varchar', length: 500, nullable: true })
  shortDescription: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'cover_image_url', type: 'varchar', length: 500, nullable: true })
  coverImageUrl: string;

  @Column({ name: 'pdf_url', type: 'varchar', length: 500, nullable: true })
  pdfUrl: string;

  @Column({ name: 'pdf_size', type: 'int', nullable: true })
  pdfSize: number;

  @Column({ type: 'enum', enum: MagazineStatus, default: MagazineStatus.DRAFT })
  status: MagazineStatus;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt: Date;

  @Column({ name: 'start_date', type: 'timestamptz', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamptz', nullable: true })
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ name: 'views_count', type: 'int', default: 0 })
  viewsCount: number;

  @Column({ name: 'reads_count', type: 'int', default: 0 })
  readsCount: number;

  @Index()
  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;
}
