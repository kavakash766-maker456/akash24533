// prisma/seed.ts
// Run with: npm run db:seed
// Creates: default categories, admin user, platform settings

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. Categories ──────────────────────────────────────────────────────────
  const categories = [
    { name: 'Social Media',    slug: 'social-media',   icon: '📱', description: 'Likes, follows, shares, comments' },
    { name: 'Surveys',         slug: 'surveys',         icon: '📋', description: 'Complete surveys and forms' },
    { name: 'App Testing',     slug: 'app-testing',     icon: '🧪', description: 'Test mobile and web apps' },
    { name: 'Website Signup',  slug: 'website-signup',  icon: '✍️', description: 'Register on websites' },
    { name: 'Data Entry',      slug: 'data-entry',      icon: '📊', description: 'Enter and organize data' },
    { name: 'Crypto Tasks',    slug: 'crypto-tasks',    icon: '₿',  description: 'Blockchain and crypto tasks' },
    { name: 'Writing',         slug: 'writing',         icon: '✏️', description: 'Content and copywriting' },
    { name: 'Video Tasks',     slug: 'video-tasks',     icon: '🎥', description: 'Watch, like, subscribe' },
    { name: 'Translation',     slug: 'translation',     icon: '🌍', description: 'Translate text content' },
    { name: 'Other',           slug: 'other',           icon: '⚡', description: 'Miscellaneous tasks' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ Created ${categories.length} categories`);

  // ── 2. Admin User ─────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123456', 12);
  const adminReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  const admin = await prisma.user.upsert({
    where: { email: 'admin@taskearnpro.com' },
    update: {},
    create: {
      email:           'admin@taskearnpro.com',
      username:        'superadmin',
      firstName:       'Super',
      lastName:        'Admin',
      passwordHash:    adminPassword,
      role:            'SUPER_ADMIN',
      status:          'ACTIVE',
      isEmailVerified: true,
      referralCode:    adminReferralCode,
      membershipPlan:  'PREMIUM',
      wallet:          { create: { balance: 0 } },
    },
  });
  console.log(`✅ Admin user created: admin@taskearnpro.com / Admin@123456`);

  // ── 3. Platform Settings ──────────────────────────────────────────────────
  const settings = [
    { key: 'platform_commission_percent', value: '10' },
    { key: 'withdrawal_fee_percent',      value: '2'  },
    { key: 'min_withdrawal_amount',       value: '5'  },
    { key: 'maintenance_mode',            value: 'false' },
    { key: 'allow_registrations',         value: 'true'  },
    { key: 'max_job_budget',              value: '1000'  },
    { key: 'referral_bonus_percent',      value: '5'     },
  ];

  for (const s of settings) {
    await prisma.platformSetting.upsert({
      where:  { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log(`✅ Platform settings configured`);

  console.log('\n🎉 Database seeded successfully!');
  console.log('📧 Admin login: admin@taskearnpro.com');
  console.log('🔑 Password:   Admin@123456');
  console.log('⚠️  CHANGE THE ADMIN PASSWORD after first login!\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
