import {
  Controller, Get, Post, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { CampaignQueryDto } from './dto/campaign-query.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../common/enums';

@ApiTags('Campaigns')
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new campaign (influencer or admin)' })
  async create(
    @Body() dto: CreateCampaignDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.campaignsService.create(dto, user.id);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List campaigns (filtered by role)' })
  async findAll(
    @Query() query: CampaignQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const isAdmin = user.role === UserRole.ADMIN;
    return this.campaignsService.findAll(query, user.id, isAdmin);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campaign details' })
  async findOne(@Param('id') id: string) {
    return this.campaignsService.findOne(id);
  }

  @Get(':id/overview')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get campaign overview with aggregated stats' })
  async getOverview(@Param('id') id: string) {
    return this.campaignsService.getOverview(id);
  }
}
