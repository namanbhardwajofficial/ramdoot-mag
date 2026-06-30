import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../common/enums';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get admin dashboard statistics' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.adminService.getAuditLogs(page || 1, limit || 50);
  }

  @Get('influencers')
  @ApiOperation({ summary: 'Get influencer management data' })
  async getInfluencers() {
    return this.adminService.getInfluencerManagement();
  }
}
