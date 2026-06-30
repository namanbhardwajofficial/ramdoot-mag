import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignQueryDto } from './dto/campaign-query.dto';
import { nanoid } from 'nanoid';
import { Campaign } from './entities/campaign.entity';
import { ClickEvent } from './entities/click-event.entity';
import { Conversion } from './entities/conversion.entity';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    @InjectRepository(Campaign)
    private campaignRepo: Repository<Campaign>,
    @InjectRepository(ClickEvent)
    private clickEventRepo: Repository<ClickEvent>,
    @InjectRepository(Conversion)
    private conversionRepo: Repository<Conversion>,
  ) {}

  /**
   * Generate a unique promo code
   */
  private generatePromoCode(name: string): string {
    // Take first 5 chars of name (uppercase, no spaces) + random 4 chars
    const prefix = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 5)
      .toUpperCase();
    const suffix = nanoid(4).toUpperCase();
    return `${prefix}${suffix}`;
  }

  /**
   * Create a new campaign with auto-generated promo code
   */
  async create(dto: CreateCampaignDto, influencerId: string) {
    const promoCode = this.generatePromoCode(dto.name);

    const campaign = this.campaignRepo.create({
      name: dto.name,
      influencerId,
      promoCode,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      sharingMediums: dto.sharingMediums || [],
      commissionRate: dto.commissionRate || 0.1,
    });

    const saved = await this.campaignRepo.save(campaign);

    this.logger.log(`Campaign created: ${saved.id} with promo code ${promoCode}`);

    return saved;
  }

  /**
   * List campaigns (influencer sees own, admin sees all)
   */
  async findAll(query: CampaignQueryDto, userId?: string, isAdmin = false) {
    const { status, page = 1, limit = 10 } = query;

    const where: FindOptionsWhere<Campaign> = {};
    if (status) where.status = status;
    if (!isAdmin && userId) where.influencerId = userId;

    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.campaignRepo.find({
        where,
        skip,
        take: limit,
        order: { createdAt: 'DESC' },
        relations: ['influencer'],
      }),
      this.campaignRepo.count({ where }),
    ]);

    // Fetch click and conversion counts for all returned campaigns
    const campaignIds = campaigns.map((c) => c.id);

    const [clickCounts, conversionCounts] = await Promise.all([
      campaignIds.length > 0
        ? this.clickEventRepo
            .createQueryBuilder('ce')
            .select('ce.campaignId', 'campaignId')
            .addSelect('COUNT(ce.id)', 'count')
            .where('ce.campaignId IN (:...ids)', { ids: campaignIds })
            .groupBy('ce.campaignId')
            .getRawMany()
        : [],
      campaignIds.length > 0
        ? this.conversionRepo
            .createQueryBuilder('conv')
            .select('conv.campaignId', 'campaignId')
            .addSelect('COUNT(conv.id)', 'count')
            .where('conv.campaignId IN (:...ids)', { ids: campaignIds })
            .groupBy('conv.campaignId')
            .getRawMany()
        : [],
    ]);

    const clickCountMap = new Map<string, number>(
      clickCounts.map((r: any) => [r.campaignId, parseInt(r.count, 10)]),
    );
    const conversionCountMap = new Map<string, number>(
      conversionCounts.map((r: any) => [r.campaignId, parseInt(r.count, 10)]),
    );

    const data = campaigns.map((campaign) => ({
      ...campaign,
      _count: {
        clickEvents: clickCountMap.get(campaign.id) || 0,
        conversions: conversionCountMap.get(campaign.id) || 0,
      },
    }));

    return {
      data,
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

  /**
   * Get campaign by ID
   */
  async findOne(id: string) {
    const campaign = await this.campaignRepo.findOne({
      where: { id },
      relations: ['influencer'],
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    const [clickEvents, conversions] = await Promise.all([
      this.clickEventRepo.find({
        where: { campaignId: id },
        order: { clickedAt: 'DESC' },
        take: 100,
      }),
      this.conversionRepo.find({
        where: { campaignId: id },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      ...campaign,
      clickEvents,
      conversions,
    };
  }

  /**
   * Get campaign overview with aggregated stats
   */
  async getOverview(id: string) {
    const campaign = await this.campaignRepo.findOne({
      where: { id },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');

    // Get click breakdown by medium
    const clicksByMedium = await this.clickEventRepo
      .createQueryBuilder('ce')
      .select('ce.medium', 'medium')
      .addSelect('COUNT(ce.id)', 'count')
      .where('ce.campaignId = :id', { id })
      .groupBy('ce.medium')
      .getRawMany();

    // Get total commission earned
    const totalCommissionResult = await this.conversionRepo
      .createQueryBuilder('conv')
      .select('SUM(conv.commissionEarned)', 'total')
      .where('conv.campaignId = :id', { id })
      .getRawOne();

    // Get counts
    const [totalClicks, totalConversions] = await Promise.all([
      this.clickEventRepo.count({ where: { campaignId: id } }),
      this.conversionRepo.count({ where: { campaignId: id } }),
    ]);

    return {
      id: campaign.id,
      name: campaign.name,
      promoCode: campaign.promoCode,
      status: campaign.status,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      commissionRate: campaign.commissionRate,
      stats: {
        totalClicks,
        totalConversions,
        conversionRate:
          totalClicks > 0
            ? ((totalConversions / totalClicks) * 100).toFixed(2) + '%'
            : '0%',
        totalCommission: totalCommissionResult?.total || 0,
        clicksByMedium: clicksByMedium.map((item: any) => ({
          medium: item.medium || 'unknown',
          count: parseInt(item.count, 10),
        })),
      },
    };
  }
}
