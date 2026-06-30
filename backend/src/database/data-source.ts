// ==========================================
// RAMDOOT Foundation - TypeORM DataSource
// Used for CLI commands (schema:sync, schema:drop)
// Environment variables loaded from .env by dotenv-cli
// ==========================================

import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://localhost:5432/ramdoot_db?schema=public',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
