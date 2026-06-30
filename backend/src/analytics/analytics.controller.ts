import { Controller, Get, Post, Param, Query, Headers, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums';
import { Request } from 'express';

@Controller()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('admin/analytics/dashboard')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Get dashboard analytics' })
  async getDashboard(@CurrentUser() user: AuthenticatedUser) {
    return this.analyticsService.getAdminDashboard();
  }

  @Get('track/:promoCode')
  @Public()
  @ApiOperation({ summary: 'Track a click from promo code (public)' })
  async trackClick(
    @Param('promoCode') promoCode: string,
    @Req() req: Request,
    @Query('medium') medium?: string,
    @Query('ref') referrer?: string,
  ) {
    return this.analyticsService.trackClick(promoCode, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      referrer,
      medium,
    });
  }
}
