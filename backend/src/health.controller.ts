// ==========================================
// RAMDOOT Foundation - Health Check Controller
// ==========================================

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Public } from './common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private dataSource: DataSource) {}

  @Get('health')
  @Public()
  @ApiOperation({ summary: 'Health check endpoint' })
  async check() {
    const dbStatus = await this.dataSource.query('SELECT NOW() as current_time')
      .then(() => 'connected')
      .catch(() => 'disconnected');

    return {
      success: true,
      message: 'RAMDOOT Backend is running',
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: dbStatus,
        memoryUsage: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
        },
      },
    };
  }
}
