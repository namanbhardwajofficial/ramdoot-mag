// ==========================================
// RAMDOOT Foundation - Database Module
// Configures TypeORM with PostgreSQL
// ==========================================

import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
