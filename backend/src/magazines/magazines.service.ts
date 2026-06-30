import {
  Injectable, NotFoundException, BadRequestException, Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike, IsNull } from 'typeorm';
import { Magazine } from './entities/magazine.entity';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { PublishMagazineDto } from './dto/publish-magazine.dto';
import { MagazineQueryDto } from './dto/magazine-query.dto';
import { MagazineStatus } from '../common/enums';

@Injectable()
export class MagazinesService {
  private readonly logger = new Logger(MagazinesService.name);

  constructor(
    @InjectRepository(Magazine)
    private readonly magazineRepo: Repository<Magazine>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  async create(dto: CreateMagazineDto, createdById: string) {
    const magazine = this.magazineRepo.create({
      title: dto.title,
      shortDescription: dto.shortDescription,
      description: dto.description,
      price: dto.price,
      createdById,
    });
    return this.magazineRepo.save(magazine);
  }

  async uploadFiles(id: string, coverImageUrl?: string, pdfUrl?: string, pdfSize?: number) {
    const magazine = await this.magazineRepo.findOne({ where: { id } });
    if (!magazine) throw new NotFoundException('Magazine not found');

    if (coverImageUrl) magazine.coverImageUrl = coverImageUrl;
    if (pdfUrl) magazine.pdfUrl = pdfUrl;
    if (pdfSize) magazine.pdfSize = pdfSize;

    return this.magazineRepo.save(magazine);
  }

  async findAll(query: MagazineQueryDto) {
    const { status, search, page = 1, limit = 12 } = query;

    const where: any = { deletedAt: IsNull() };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: ILike(`%${search}%`) },
        { shortDescription: ILike(`%${search}%`) },
      ];
    }

    const skip = (page - 1) * limit;

    const [magazines, total] = await Promise.all([
      this.magazineRepo.find({
        where,
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
        relations: { createdBy: true },
      }),
      this.magazineRepo.count({ where }),
    ]);

    return {
      data: magazines,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string) {
    const magazine = await this.magazineRepo.findOne({
      where: { id },
      relations: { createdBy: true },
    });

    if (!magazine) throw new NotFoundException('Magazine not found');

    // Increment view count
    await this.magazineRepo.increment({ id }, 'viewsCount', 1).catch(() => {});

    return magazine;
  }

  async update(id: string, dto: UpdateMagazineDto) {
    const magazine = await this.magazineRepo.findOne({ where: { id } });
    if (!magazine) throw new NotFoundException('Magazine not found');

    Object.assign(magazine, dto);
    return this.magazineRepo.save(magazine);
  }

  async publish(id: string, dto: PublishMagazineDto, actorId: string) {
    const magazine = await this.magazineRepo.findOne({ where: { id } });
    if (!magazine) throw new NotFoundException('Magazine not found');

    if (!magazine.pdfUrl) {
      throw new BadRequestException('Cannot publish without a PDF file');
    }

    magazine.status = MagazineStatus.LIVE;
    magazine.publishedAt = new Date();
    const published = await this.magazineRepo.save(magazine);

    // Audit log
    await this.auditLogRepo.save({
      actorId,
      action: 'PUBLISH_MAGAZINE',
      entity: 'magazine',
      entityId: id,
      newValue: { status: 'LIVE', notifySubscribers: dto.notifySubscribers },
    });

    this.logger.log(`Magazine ${id} published by ${actorId}`);

    // TODO: Trigger notification to subscribers if dto.notifySubscribers is true
    if (dto.notifySubscribers) {
      this.logger.log(`Notification pending for subscribers about magazine ${id}`);
    }

    return published;
  }
}
