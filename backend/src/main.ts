// ==========================================
// RAMDOOT Foundation - Main Entry Point
// Bootstrap the NestJS application with all
// middleware, pipes, and Swagger documentation
// ==========================================

import { NestFactory } from '@nestjs/core';
import {
  ValidationPipe,
  Logger,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import express from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Create the NestJS application
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // ==========================================
  // Security Middleware
  // ==========================================
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));
  app.use(compression());
  app.use(cookieParser());

  // ==========================================
  // CORS Configuration
  // ==========================================
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:3001');
  app.enableCors({
    origin: corsOrigins.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // ==========================================
  // API Versioning
  // ==========================================
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // ==========================================
  // Global Validation Pipe
  // ==========================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw on unknown properties
      transform: true, // Auto-transform types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ==========================================
  // Global API Prefix
  // ==========================================
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health', 'track/:promoCode'],
  });

  // ==========================================
  // Swagger / OpenAPI Documentation
  // ==========================================
  const swaggerConfig = new DocumentBuilder()
    .setTitle('RAMDOOT Foundation API')
    .setDescription(
      'Backend API for the RAMDOOT Foundation digital magazine platform. ' +
      'Supports multi-step authentication, magazine publications, subscription management, ' +
      'influencer campaigns with promo codes, and analytics tracking.',
    )
    .setVersion('1.0')
    .setContact('RAMDOOT Foundation', 'https://ramdoot.com', 'support@ramdoot.com')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User registration, login, and token management')
    .addTag('Users', 'User profile management and admin user administration')
    .addTag('Magazines', 'Magazine/publication CRUD and publishing workflow')
    .addTag('Subscriptions', 'Subscription plans and user subscriptions')
    .addTag('Campaigns', 'Influencer campaign management with promo codes')
    .addTag('Payments', 'Payment processing and Razorpay integration')
    .addTag('Earnings & Payouts', 'Influencer earnings, bank accounts, and withdrawals')
    .addTag('Notifications', 'In-app notification management')
    .addTag('Admin', 'Admin dashboard, audit logs, and management')
    .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });

  // ==========================================
  // Serve Uploaded Files (Static)
  // ==========================================
  const uploadPath = require('path').join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadPath));

  // ==========================================
  // Start Server
  // ==========================================
  const port = configService.get<number>('PORT', 3000);
  const appName = configService.get<string>('APP_NAME', 'RAMDOOT Backend');

  await app.listen(port, () => {
    logger.log(`${appName} is running on http://localhost:${port}`);
    logger.log(`API prefix: ${apiPrefix}`);
    logger.log(`Swagger docs: http://localhost:${port}/docs`);
    logger.log(`Environment: ${configService.get<string>('NODE_ENV', 'development')}`);
  });
}

bootstrap().catch((err) => {
  const logger = new Logger('Bootstrap');
  logger.error('Failed to start application', err.stack);
  process.exit(1);
});
