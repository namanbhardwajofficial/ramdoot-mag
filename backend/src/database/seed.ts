// ==========================================
// RAMDOOT Foundation - Database Seed Script
// Run: npx ts-node -r tsconfig-paths/register src/database/seed.ts
// ==========================================

import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import {
  UserRole, UserStatus, MagazineStatus, BillingCycle,
  CampaignStatus, PaymentStatus, NotificationType,
} from '../common/enums';

async function main() {
  console.log('🌱 Starting seed...\n');

  const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL || 'postgresql://ramdoot:ramdoot123@localhost:5432/ramdoot_db?schema=public',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await AppDataSource.initialize();
  console.log('  Database connected');

  // Clean existing data
  console.log('  Cleaning existing data...');
  const tables = [
    'payouts', 'bank_accounts', 'conversions', 'click_events', 'campaigns',
    'user_subscriptions', 'subscription_plan_magazines', 'subscription_plans',
    'payments', 'notifications', 'audit_logs', 'device_sessions',
    'refresh_tokens', 'email_otps', 'magazines', 'users',
  ];
  for (const table of tables) {
    await AppDataSource.query(`DELETE FROM "${table}"`);
  }

  const passwordHash = await bcrypt.hash('Admin@123', 12);

  // ==========================================
  // Users
  // ==========================================
  console.log('  Creating users...');

  const adminResult = await AppDataSource.query(
    `INSERT INTO "users" (id, full_name, email, phone, country_code, password_hash, role, is_email_verified, status, referral_code, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
    ['00000000-0000-0000-0000-000000000001', 'Admin Ramdoot', 'admin@ramdoot.com', '9999999999', '+91', passwordHash, UserRole.ADMIN, true, UserStatus.ACTIVE, 'RMDADMIN01'],
  );
  const adminId = adminResult[0].id;

  const influencerResult = await AppDataSource.query(
    `INSERT INTO "users" (id, full_name, email, phone, country_code, password_hash, role, is_email_verified, status, referral_code, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
    ['00000000-0000-0000-0000-000000000002', 'Arun Sharma', 'arun@example.com', '9876543210', '+91', passwordHash, UserRole.INFLUENCER, true, UserStatus.ACTIVE, 'RMDARUN01'],
  );
  const influencerId = influencerResult[0].id;

  const readerResult = await AppDataSource.query(
    `INSERT INTO "users" (id, full_name, email, phone, country_code, password_hash, role, is_email_verified, status, referral_code, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
    ['00000000-0000-0000-0000-000000000003', 'Priya Patel', 'priya@example.com', '8765432109', '+91', passwordHash, UserRole.USER, true, UserStatus.ACTIVE, 'RMDPRIYA'],
  );
  const readerId = readerResult[0].id;

  const reader2Result = await AppDataSource.query(
    `INSERT INTO "users" (id, full_name, email, phone, country_code, password_hash, role, is_email_verified, status, referral_code, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
    ['00000000-0000-0000-0000-000000000004', 'Rahul Verma', 'rahul@example.com', '7654321098', '+91', passwordHash, UserRole.USER, true, UserStatus.ACTIVE, 'RMDRV123'],
  );
  const reader2Id = reader2Result[0].id;

  console.log('    ✓ Created 4 users');

  // ==========================================
  // Magazines
  // ==========================================
  console.log('  Creating magazines...');

  const m1 = await AppDataSource.query(
    `INSERT INTO "magazines" (id, title, short_description, description, status, published_at, price, views_count, reads_count, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
    [uuidv4(), 'Hindu Heritage - June 2026', 'Exploring the architectural marvels of ancient Hindu temples',
      'A deep dive into ancient Hindu temple architecture.', MagazineStatus.LIVE, '2026-06-01', 49, 1250, 890, adminId],
  );

  const m2 = await AppDataSource.query(
    `INSERT INTO "magazines" (id, title, short_description, description, status, published_at, price, views_count, reads_count, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()) RETURNING id`,
    [uuidv4(), 'Vedic Sciences & Mathematics', 'Ancient Indian contributions to math and astronomy',
      'Discover the contributions of ancient Indian scholars.', MagazineStatus.LIVE, '2026-05-15', 49, 980, 720, adminId],
  );

  const m3 = await AppDataSource.query(
    `INSERT INTO "magazines" (id, title, short_description, status, start_date, end_date, price, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
    [uuidv4(), 'Festivals of India - Special Edition', 'The spiritual significance of major Hindu festivals',
    MagazineStatus.SCHEDULED, '2026-07-01', '2026-07-31', 39, adminId],
  );

  const m4 = await AppDataSource.query(
    `INSERT INTO "magazines" (id, title, short_description, status, price, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id`,
    [uuidv4(), 'Yoga & Meditation Guide', 'Ancient wisdom for modern wellness', MagazineStatus.DRAFT, 59, adminId],
  );

  const [mag1, mag2, mag3, mag4] = [m1[0].id, m2[0].id, m3[0].id, m4[0].id];
  console.log('    ✓ Created 4 magazines');

  // ==========================================
  // Subscription Plans
  // ==========================================
  console.log('  Creating subscription plans...');

  const p1 = await AppDataSource.query(
    `INSERT INTO "subscription_plans" (id, name, description, billing_cycle, price, is_active, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id`,
    [uuidv4(), 'Monthly Premium', 'Access to all monthly publications', BillingCycle.MONTHLY, 149, true, adminId],
  );
  const p2 = await AppDataSource.query(
    `INSERT INTO "subscription_plans" (id, name, description, billing_cycle, price, is_active, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id`,
    [uuidv4(), 'Quarterly Saver', '3 months access at discounted rate', BillingCycle.MONTHLY, 399, true, adminId],
  );
  const p3 = await AppDataSource.query(
    `INSERT INTO "subscription_plans" (id, name, description, billing_cycle, price, is_active, created_by, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) RETURNING id`,
    [uuidv4(), 'Yearly Premium Plus', 'Full year access with exclusive content', BillingCycle.YEARLY, 1299, true, adminId],
  );

  const [plan1, plan2, plan3] = [p1[0].id, p2[0].id, p3[0].id];

  // Link magazines to plans
  await AppDataSource.query(
    `INSERT INTO "subscription_plan_magazines" (plan_id, magazine_id) VALUES
     ($1, $2), ($1, $3), ($4, $2), ($4, $3), ($4, $5), ($6, $2), ($6, $3), ($6, $5), ($6, $7)`,
    [plan1, mag1, mag2, plan2, mag3, plan3, mag4],
  );

  console.log('    ✓ Created 3 subscription plans');

  // ==========================================
  // Payments & Subscriptions
  // ==========================================
  console.log('  Creating payments and subscriptions...');

  const pay1 = await AppDataSource.query(
    `INSERT INTO "payments" (id, user_id, amount, status, payment_method, payment_provider_id, related_type, description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
    [uuidv4(), readerId, 149, PaymentStatus.SUCCESS, 'UPI', 'pay_test_001', 'subscription', 'Monthly Premium subscription'],
  );

  const pay2 = await AppDataSource.query(
    `INSERT INTO "payments" (id, user_id, amount, status, payment_method, payment_provider_id, related_type, description, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
    [uuidv4(), reader2Id, 1299, PaymentStatus.SUCCESS, 'CARD', 'pay_test_002', 'subscription', 'Yearly Premium Plus subscription'],
  );

  const [payment1Id, payment2Id] = [pay1[0].id, pay2[0].id];

  await AppDataSource.query(
    `INSERT INTO "user_subscriptions" (id, user_id, plan_id, payment_id, status, start_date, renewal_date, end_date, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
    [uuidv4(), readerId, plan1, payment1Id, 'ACTIVE', '2026-06-01', '2026-07-01', '2026-07-01'],
  );
  await AppDataSource.query(
    `INSERT INTO "user_subscriptions" (id, user_id, plan_id, payment_id, status, start_date, renewal_date, end_date, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
    [uuidv4(), reader2Id, plan3, payment2Id, 'ACTIVE', '2026-01-01', '2027-01-01', '2027-01-01'],
  );

  // Update total spent
  await AppDataSource.query(`UPDATE "users" SET total_spent = total_spent + 149 WHERE id = $1`, [readerId]);
  await AppDataSource.query(`UPDATE "users" SET total_spent = total_spent + 1299 WHERE id = $1`, [reader2Id]);

  console.log('    ✓ Created payments and subscriptions');

  // ==========================================
  // Campaigns
  // ==========================================
  console.log('  Creating campaigns...');

  const c1 = await AppDataSource.query(
    `INSERT INTO "campaigns" (id, name, influencer_id, promo_code, start_date, end_date, sharing_mediums, status, commission_rate, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id`,
    [uuidv4(), 'Summer Reading Drive', influencerId, 'ARUNAF500', '2026-06-01', '2026-07-31',
    JSON.stringify(['instagram', 'facebook', 'whatsapp']), CampaignStatus.ACTIVE, 0.20],
  );
  const c2 = await AppDataSource.query(
    `INSERT INTO "campaigns" (id, name, influencer_id, promo_code, start_date, end_date, sharing_mediums, status, commission_rate, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING id`,
    [uuidv4(), 'Festival Special Promo', influencerId, 'ARUNAFEST', '2026-05-01', '2026-05-31',
    JSON.stringify(['instagram', 'whatsapp']), CampaignStatus.COMPLETED, 0.15],
  );
  const [camp1Id, camp2Id] = [c1[0].id, c2[0].id];

  console.log('    ✓ Created 2 campaigns');

  // ==========================================
  // Click Events & Conversions
  // ==========================================
  console.log('  Creating click events and conversions...');

  const mediums = ['instagram', 'facebook', 'whatsapp', 'twitter'];
  const clickIds: string[] = [];

  for (let i = 0; i < 25; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const clickedAt = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const medium = mediums[Math.floor(Math.random() * mediums.length)];
    const converted = i < 5;

    const result = await AppDataSource.query(
      `INSERT INTO "click_events" (id, campaign_id, promo_code, ip_address, user_agent, referrer, medium, clicked_at, converted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [uuidv4(), camp1Id, 'ARUNAF500', `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
      i % 3 === 0 ? 'https://instagram.com/arunsharma' : i % 3 === 1 ? 'https://facebook.com/arunsharma' : null,
        medium, clickedAt, converted],
    );
    clickIds.push(result[0].id);
  }

  for (let i = 0; i < 5; i++) {
    const amount = i % 2 === 0 ? 149 : 49;
    await AppDataSource.query(
      `INSERT INTO "conversions" (id, campaign_id, click_event_id, user_id, amount, item_type, item_id, commission_earned, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [uuidv4(), camp1Id, clickIds[i], readerId, amount, i % 2 === 0 ? 'magazine' : 'magazine',
      i % 2 === 0 ? mag1 : mag2, amount * 0.20],
    );
  }

  console.log('    ✓ Created 25 click events and 5 conversions');

  // ==========================================
  // Notifications
  // ==========================================
  console.log('  Creating notifications...');

  await AppDataSource.query(
    `INSERT INTO "notifications" (id, user_id, title, message, type, is_read, link, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [uuidv4(), readerId, 'Welcome to Ramdoot!', 'Namaste! Welcome to Ramdoot Foundation.', NotificationType.SUCCESS, true, null],
  );
  await AppDataSource.query(
    `INSERT INTO "notifications" (id, user_id, title, message, type, is_read, link, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [uuidv4(), readerId, 'New Magazine Available', '"Hindu Heritage - June 2026" published!', NotificationType.INFO, false, `/magazines/${mag1}`],
  );
  await AppDataSource.query(
    `INSERT INTO "notifications" (id, user_id, title, message, type, is_read, link, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [uuidv4(), readerId, 'Subscription Renewal', 'Your Monthly Premium renews July 1.', NotificationType.WARNING, false, null],
  );
  await AppDataSource.query(
    `INSERT INTO "notifications" (id, user_id, title, message, type, is_read, link, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [uuidv4(), influencerId, 'Campaign Performance', 'Your campaign has 25 clicks and 5 conversions!', NotificationType.INFO, false, null],
  );
  await AppDataSource.query(
    `INSERT INTO "notifications" (id, user_id, title, message, type, is_read, link, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
    [uuidv4(), influencerId, 'Welcome to Influencer Program', 'You are now part of Ramdoot Influencer Program!', NotificationType.SUCCESS, true, null],
  );

  console.log('    ✓ Created notifications');

  // ==========================================
  // Bank Account & Payout
  // ==========================================
  console.log('  Creating bank account and payout...');

  const ba = await AppDataSource.query(
    `INSERT INTO "bank_accounts" (id, user_id, holder_name, bank_name, account_number, ifsc_code, is_verified, is_default, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) RETURNING id`,
    [uuidv4(), influencerId, 'Arun Sharma', 'State Bank of India', 'encrypted:SBIN1234567890', 'SBIN0001234', true, true],
  );

  await AppDataSource.query(
    `INSERT INTO "payouts" (id, user_id, amount, bank_account_id, status, notes, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
    [uuidv4(), influencerId, 1500, ba[0].id, 'PENDING', 'June 2026 commission payout'],
  );

  console.log('    ✓ Created bank account and payout');

  // ==========================================
  // Audit Logs
  // ==========================================
  console.log('  Creating audit logs...');

  await AppDataSource.query(
    `INSERT INTO "audit_logs" (id, actor_id, action, entity, entity_id, new_value, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [uuidv4(), adminId, 'SEED_DATABASE', 'system', null, JSON.stringify({ action: 'Database seeded' })],
  );
  await AppDataSource.query(
    `INSERT INTO "audit_logs" (id, actor_id, action, entity, entity_id, new_value, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [uuidv4(), adminId, 'PUBLISH_MAGAZINE', 'magazine', mag1, JSON.stringify({ status: 'LIVE' })],
  );
  await AppDataSource.query(
    `INSERT INTO "audit_logs" (id, actor_id, action, entity, entity_id, new_value, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
    [uuidv4(), adminId, 'CREATE_SUBSCRIPTION_PLAN', 'subscription_plan', plan1, JSON.stringify({ name: 'Monthly Premium', price: 149 })],
  );

  console.log('    ✓ Created audit logs');

  // ==========================================
  // Summary
  // ==========================================
  console.log('\n========================================');
  console.log('  ✅ Seed completed successfully!');
  console.log('========================================');
  console.log('\n  Credentials:');
  console.log('  ┌─────────────────┬──────────────────────┬──────────────┐');
  console.log('  │ Role            │ Email                │ Password     │');
  console.log('  ├─────────────────┼──────────────────────┼──────────────┤');
  console.log('  │ Admin           │ admin@ramdoot.com    │ Admin@123    │');
  console.log('  │ Influencer      │ arun@example.com     │ Admin@123    │');
  console.log('  │ Reader          │ priya@example.com    │ Admin@123    │');
  console.log('  │ Reader          │ rahul@example.com    │ Admin@123    │');
  console.log('  └─────────────────┴──────────────────────┴──────────────┘');
  console.log('\n  Sample promo code: ARUNAF500');

  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});
