import {
  Controller, Get, Post, Patch, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { PurchaseSubscriptionDto } from './dto/purchase-subscription.dto';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Public } from '../common/decorators/public.decorator';
import { UserRole } from '../common/enums';
import { ParseUUIDPipe } from '@nestjs/common';

@ApiTags('Subscriptions')
@Controller()
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('subscription-plans')
  @Public()
  @ApiOperation({ summary: 'Get all active subscription plans' })
  async listPlans(@Query('includeInactive') includeInactive?: string) {
    return this.subscriptionsService.listPlans(includeInactive === 'true');
  }

  @Post('subscription-plans')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Create a subscription plan' })
  async createPlan(
    @Body() dto: CreatePlanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.subscriptionsService.createPlan(dto, user.id);
  }

  @Get('subscription-plans/:id')
  @Public()
  @ApiOperation({ summary: 'Get subscription plan by ID' })
  async getPlan(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.getPlan(id);
  }

  @Patch('subscription-plans/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Update a subscription plan' })
  async updatePlan(@Param('id', ParseUUIDPipe) id: string, @Body() dto: Partial<CreatePlanDto>) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  @Patch('subscription-plans/:id/toggle')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Toggle plan active/inactive' })
  async togglePlan(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionsService.togglePlanActive(id);
  }

  @Get('user-subscriptions/me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my subscriptions' })
  async mySubscriptions(@CurrentUser() user: AuthenticatedUser) {
    return this.subscriptionsService.getUserSubscriptions(user.id);
  }

  @Post('subscriptions/purchase')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Purchase a subscription plan' })
  async purchase(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PurchaseSubscriptionDto,
  ) {
    return this.subscriptionsService.purchaseSubscription(user.id, dto.planId, dto.paymentId);
  }
}
