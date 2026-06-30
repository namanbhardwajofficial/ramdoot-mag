// ==========================================
// RAMDOOT Foundation - App Module
// Root module that imports all feature modules
// ==========================================

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { HealthController } from './health.controller';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MagazinesModule } from './magazines/magazines.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { PaymentsModule } from './payments/payments.module';
import { EarningsModule } from './earnings/earnings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  controllers: [HealthController],
  imports: [
    // ===== Global Configuration =====
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ===== Rate Limiting =====
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: (config.get<number>('THROTTLE_TTL') || 60) * 1000,
            limit: config.get<number>('THROTTLE_LIMIT') || 100,
          },
        ],
      }),
    }),

    // ===== Scheduled Tasks =====
    ScheduleModule.forRoot(),

    // ===== Database (TypeORM + PostgreSQL) =====
    DatabaseModule,

    // ===== Feature Modules =====
    AuthModule,
    UsersModule,
    MagazinesModule,
    SubscriptionsModule,
    CampaignsModule,
    PaymentsModule,
    EarningsModule,
    AnalyticsModule,
    NotificationsModule,
    AdminModule,
  ],
  providers: [
    // ===== Global Guards =====
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // JWT auth by default; @Public() to bypass
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // ===== Global Interceptors =====
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },

    // ===== Global Exception Filter =====
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
