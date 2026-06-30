# RAMDOOT Foundation - Backend API

A production-ready **NestJS + TypeScript** backend for the RAMDOOT Foundation digital magazine platform, featuring multi-step authentication, magazine publications, subscription management, influencer marketing with promo codes, and comprehensive analytics.

## Tech Stack

| Category       | Technology                                         |
| -------------- | -------------------------------------------------- |
| Runtime        | Node.js 24.17+ + TypeScript (strict)                |
| Framework      | NestJS 10                                          |
| Database       | PostgreSQL 16 + TypeORM                            |
| Cache/Queue    | Redis + BullMQ                                     |
| Auth           | JWT + Refresh Tokens + bcryptjs                    |
| File Storage   | AWS S3 (local disk in dev)                         |
| Payments       | Razorpay SDK + Webhooks                            |
| API Docs       | Swagger / OpenAPI 3.0                              |
| Validation     | class-validator + class-transformer                |

## Project Structure

```
src/
├── common/              # Shared: decorators, guards, filters, interceptors, DTOs
│   ├── decorators/      # @CurrentUser, @Roles, @Public
│   ├── filters/         # Global exception filter
│   ├── guards/          # JwtAuthGuard, RolesGuard
│   ├── interceptors/    # ResponseInterceptor
│   └── interfaces/      # API response types
├── database/            # TypeORM + DataSource config
├── auth/                # Multi-step signup, JWT, email OTP
│   ├── dto/             # Request validation DTOs
│   └── strategies/      # Passport JWT strategies
├── users/               # Profile & admin user management
├── magazines/           # CRUD + publish workflow + file upload
├── subscriptions/       # Plans & user subscriptions
├── campaigns/           # Influencer campaigns & promo codes
├── payments/            # Razorpay integration & webhooks
├── earnings/            # Bank accounts, payouts, withdrawals
├── analytics/           # Dashboard stats, click tracking, conversions
├── notifications/       # In-app notification system
├── admin/               # Admin dashboard, audit logs, management
├── app.module.ts        # Root module
├── health.controller.ts # Health check endpoint
└── main.ts              # Bootstrap & Swagger setup
```

## Prerequisites

- **Node.js** 24.17.0+ (via nvm recommended)
- **Yarn** 1.22.x
- **PostgreSQL** 16+ (running locally)
- **Redis** 7+ (running locally — needed by BullMQ for background job queues)

### Setting up Node.js with nvm

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash

# Install and use the correct Node version
nvm install 24.17.0
nvm use 24.17.0

# Verify
node --version   # → v24.17.0
```

### Installing PostgreSQL (macOS)

```bash
brew install postgresql@16
brew services start postgresql@16
pg_isready       # Should show "accepting connections"
```

### Installing PostgreSQL (Linux)

```bash
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
pg_isready
```

### Installing & Starting Redis (macOS)

```bash
brew install redis
brew services start redis
redis-cli ping   # Should reply "PONG"
```

Redis runs on port 6379 by default. The connection is configured in `.env`:
```
REDIS_HOST=localhost
REDIS_PORT=6379
```

> **Note:** Redis is used by BullMQ for background job queues (email sending, analytics aggregation, payout processing). The app starts without it, but background jobs won't work.

### Installing & Starting Redis (Linux)

```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
redis-cli ping   # Should reply "PONG"
```

### Create the PostgreSQL Database

```bash
# Connect to PostgreSQL and create the database user
psql postgres -c "CREATE USER ramdoot WITH PASSWORD 'ramdoot123';"
psql postgres -c "CREATE DATABASE ramdoot_db OWNER ramdoot;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE ramdoot_db TO ramdoot;"
psql postgres -c "GRANT ALL ON SCHEMA public TO ramdoot;"

# If you already ran sync/app and tables are owned by another user:
psql postgres -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ramdoot;"
psql postgres -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ramdoot;"

# Or use your system user (simpler — just edit .env):
# DATABASE_URL=postgresql://localhost:5432/ramdoot_db?schema=public
```

## Quick Start

### 1. Use the correct Node version

```bash
nvm use 24.17.0   # or: nvm use (reads .nvmrc)
```

### 2. Install dependencies

```bash
cd ramdoot-backend
yarn install
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env to match your local PostgreSQL credentials
```

The default `.env` uses:
- PostgreSQL at `localhost:5432`, user `ramdoot`, database `ramdoot_db`
- Redis at `localhost:6379`

### 4. Database Setup

The app creates tables automatically on startup (`synchronize: true` in dev mode). To sync+seed:

```bash
# Start the app once to create tables (then Ctrl+C)
yarn start:dev

# Or sync schema manually:
npx ts-node -r tsconfig-paths/register node_modules/.bin/typeorm schema:sync -d src/database/data-source.ts

# Then seed the database:
npx ts-node -r tsconfig-paths/register src/database/seed.ts
```

### 5. Start Development Server

```bash
yarn start:dev
```

Server starts at **http://localhost:3000**

### 6. Access Swagger Docs

Open **http://localhost:3000/docs** in your browser.

### 4. Start Development Server

```bash
yarn start:dev
```

Server starts at **http://localhost:3000**

### 5. Access Swagger Docs

Open **http://localhost:3000/docs** in your browser.

## Default Credentials (after seeding)

| Role       | Email              | Password   |
| ---------- | ------------------ | ---------- |
| Admin      | admin@ramdoot.com  | Admin@123  |
| Influencer | arun@example.com   | Admin@123  |
| Reader     | priya@example.com  | Admin@123  |
| Reader     | rahul@example.com  | Admin@123  |

Sample promo code: `ARUNAF500`

## API Endpoints

### Authentication
| Method | Endpoint                  | Description              |
| ------ | ------------------------- | ------------------------ |
| POST   | /api/v1/auth/signup/step1 | Step 1: Submit details   |
| POST   | /api/v1/auth/signup/step2 | Step 2: Verify OTP + set password |
| POST   | /api/v1/auth/verify-email | Verify email OTP         |
| POST   | /api/v1/auth/login        | Login with credentials   |
| POST   | /api/v1/auth/refresh      | Refresh JWT tokens       |
| POST   | /api/v1/auth/forgot-password | Request password reset |
| POST   | /api/v1/auth/reset-password | Reset password with OTP |

### Users
| Method | Endpoint              | Description                        |
| ------ | --------------------- | ---------------------------------- |
| GET    | /api/v1/users/me      | Get current user profile           |
| PATCH  | /api/v1/users/me      | Update profile                     |
| GET    | /api/v1/users         | [Admin] List users with filters    |
| POST   | /api/v1/users         | [Admin] Create user (invite)       |
| GET    | /api/v1/users/:id     | [Admin] Get user details           |
| PATCH  | /api/v1/users/:id/status | [Admin] Update user status      |

### Magazines
| Method | Endpoint                         | Description                   |
| ------ | -------------------------------- | ----------------------------- |
| POST   | /api/v1/magazines                | [Admin] Create magazine       |
| POST   | /api/v1/magazines/upload         | [Admin] Upload PDF + cover    |
| GET    | /api/v1/magazines                | List magazines (with filters) |
| GET    | /api/v1/magazines/:id            | Get magazine details          |
| PATCH  | /api/v1/magazines/:id            | [Admin] Update magazine       |
| POST   | /api/v1/magazines/:id/publish    | [Admin] Publish magazine      |

### Subscriptions
| Method | Endpoint                          | Description                   |
| ------ | --------------------------------- | ----------------------------- |
| GET    | /api/v1/subscription-plans        | List active plans             |
| POST   | /api/v1/subscription-plans        | [Admin] Create plan           |
| GET    | /api/v1/subscription-plans/:id    | Get plan details              |
| PATCH  | /api/v1/subscription-plans/:id    | [Admin] Update plan           |
| PATCH  | /api/v1/subscription-plans/:id/toggle | [Admin] Toggle active    |
| GET    | /api/v1/user-subscriptions/me     | Get my subscriptions          |
| POST   | /api/v1/subscriptions/purchase    | Purchase subscription         |

### Campaigns & Tracking
| Method | Endpoint                      | Description                      |
| ------ | ----------------------------- | -------------------------------- |
| POST   | /api/v1/campaigns             | Create campaign                  |
| GET    | /api/v1/campaigns             | List campaigns                   |
| GET    | /api/v1/campaigns/:id         | Get campaign details             |
| GET    | /api/v1/campaigns/:id/overview | Get campaign stats              |
| GET    | /api/v1/track/:promoCode      | Public click tracker             |

### Payments
| Method | Endpoint                  | Description               |
| ------ | ------------------------- | ------------------------- |
| POST   | /api/v1/payments          | Record successful payment |
| GET    | /api/v1/payments/me       | My payment history        |
| POST   | /api/v1/webhooks/razorpay | Razorpay webhook handler  |

### Earnings & Payouts
| Method | Endpoint                   | Description                  |
| ------ | -------------------------- | ---------------------------- |
| GET    | /api/v1/earnings           | Get earnings overview        |
| POST   | /api/v1/bank-accounts      | Add bank account             |
| GET    | /api/v1/bank-accounts      | List bank accounts           |
| POST   | /api/v1/earnings/withdraw  | Request withdrawal           |
| GET    | /api/v1/earnings/payouts   | Payout history               |

### Notifications
| Method | Endpoint                         | Description                    |
| ------ | -------------------------------- | ------------------------------ |
| GET    | /api/v1/notifications            | Get my notifications           |
| GET    | /api/v1/notifications/unread-count | Get unread count             |
| PATCH  | /api/v1/notifications/:id/read   | Mark as read                   |
| POST   | /api/v1/notifications/read-all   | Mark all as read               |

### Admin
| Method | Endpoint                     | Description                  |
| ------ | ---------------------------- | ---------------------------- |
| GET    | /api/v1/admin/dashboard      | Dashboard statistics         |
| GET    | /api/v1/admin/audit-logs     | Audit logs                   |
| GET    | /api/v1/admin/influencers    | Influencer management        |

### Health
| Method | Endpoint | Description       |
| ------ | -------- | ----------------- |
| GET    | /health  | Health check + DB |

## TypeORM Commands

```bash
# Sync schema to database (create/update tables)
npx ts-node -r tsconfig-paths/register node_modules/.bin/typeorm schema:sync -d src/database/data-source.ts

# Drop all tables
npx ts-node -r tsconfig-paths/register node_modules/.bin/typeorm schema:drop -d src/database/data-source.ts

# Generate a migration (for production)
npx ts-node -r tsconfig-paths/register node_modules/.bin/typeorm migration:generate -d src/database/data-source.ts src/database/migrations/Init
```

> **Dev mode only:** TypeORM is configured with `synchronize: true`, so tables are created/updated automatically when the app starts. No manual migration commands needed for development.

## Seed Script

```bash
# The seed script reads DATABASE_URL from .env automatically
# It connects as the same user the app uses, avoiding permission issues
npx ts-node -r tsconfig-paths/register src/database/seed.ts

# If you get "permission denied" errors, grant table access:
psql -d ramdoot_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ramdoot;"
psql -d ramdoot_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ramdoot;"
```

## Environment Variables

Key environment variables (see `.env.example` for full list):

| Variable              | Description                    | Default                           |
| --------------------- | ------------------------------ | --------------------------------- |
| `DATABASE_URL`        | PostgreSQL connection string   | postgresql://ramdoot:ramdoot123@localhost:5432/ramdoot_db |
| `REDIS_HOST`          | Redis host                     | localhost                         |
| `REDIS_PORT`          | Redis port                     | 6379                              |
| `JWT_SECRET`          | JWT signing secret             | (change in production)            |
| `JWT_REFRESH_SECRET`  | Refresh token secret           | (change in production)            |
| `RAZORPAY_KEY_ID`     | Razorpay API key               | -                                 |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret            | -                                 |
| `ENCRYPTION_KEY`      | 256-bit hex key for encryption | (change in production)            |

### Quick `.env` for local dev (trust auth):

If your local PostgreSQL lets you connect without a password:

```
DATABASE_URL=postgresql://localhost:5432/ramdoot_db?schema=public
```

## Features Implemented

- ✅ **Multi-step signup** with email OTP verification
- ✅ **JWT + Refresh Token** authentication with "Remember for 30 days"
- ✅ **Role-based access** (User, Influencer, Admin)
- ✅ **File upload** (PDF + images) with validation
- ✅ **Magazine publishing workflow** (Draft → Scheduled → Live → Archived)
- ✅ **Subscription management** with multiple plans
- ✅ **Promo code generation** and campaign tracking
- ✅ **Click tracking** per medium (Instagram, Facebook, WhatsApp)
- ✅ **Commission calculation** and influencer earnings
- ✅ **Bank account management** with AES-256 encryption
- ✅ **Withdrawal/payout** flow
- ✅ **Razorpay webhook** skeleton
- ✅ **Admin dashboard** with analytics
- ✅ **Audit logging** for admin actions
- ✅ **In-app notifications**
- ✅ **Rate limiting**
- ✅ **Swagger API documentation**
- ✅ **Consistent API response format**


# RAMDOOT Foundation
