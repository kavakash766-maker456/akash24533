// src/modules/admin/admin.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';

const router = Router();
const wrap   = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

const isAdmin = [authenticate, authorize('ADMIN', 'SUPER_ADMIN')];

// ── Dashboard stats ───────────────────────────────────────────────────────────
router.get('/dashboard', ...isAdmin, wrap(async (_req: any, res: any) => {
  const [
    totalUsers, activeJobs, pendingJobs,
    pendingWithdrawals, totalRevenue
  ] = await Promise.all([
    prisma.user.count(),
    prisma.job.count({ where: { status: 'ACTIVE' } }),
    prisma.job.count({ where: { status: 'PENDING_REVIEW' } }),
    prisma.withdrawal.count({ where: { status: 'PENDING' } }),
    prisma.transaction.aggregate({
      where: { type: 'PLATFORM_FEE', status: 'COMPLETED' },
      _sum:  { amount: true },
    }),
  ]);

  res.json({
    totalUsers,
    activeJobs,
    pendingJobs,
    pendingWithdrawals,
    platformRevenue: totalRevenue._sum.amount || 0,
  });
}));

// ── Analytics: monthly revenue ────────────────────────────────────────────────
router.get('/analytics', ...isAdmin, wrap(async (_req: any, res: any) => {
  // Get last 12 months of data
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const date  = new Date();
    date.setMonth(date.getMonth() - i);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end   = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    const [revenue, newUsers, newJobs] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: 'PLATFORM_FEE', status: 'COMPLETED', createdAt: { gte: start, lte: end } },
        _sum:  { amount: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.job.count({ where: { createdAt: { gte: start, lte: end } } }),
    ]);

    months.push({
      month:    start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      revenue:  Number(revenue._sum.amount || 0),
      newUsers,
      newJobs,
    });
  }
  res.json(months);
}));

// ── Audit logs ────────────────────────────────────────────────────────────────
router.get('/audit-logs', ...isAdmin, wrap(async (req: any, res: any) => {
  const page  = Math.max(1, Number(req.query.page) || 1);
  const limit = 50;
  const skip  = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      skip, take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true } } },
    }),
    prisma.auditLog.count(),
  ]);
  res.json({ data: logs, total, page, pages: Math.ceil(total / limit) });
}));

// ── Platform settings ─────────────────────────────────────────────────────────
router.get('/settings', ...isAdmin, wrap(async (_req: any, res: any) => {
  const settings = await prisma.platformSetting.findMany();
  res.json(Object.fromEntries(settings.map(s => [s.key, s.value])));
}));

router.put('/settings', authenticate, authorize('SUPER_ADMIN'), wrap(async (req: any, res: any) => {
  const updates = Object.entries(req.body);
  await Promise.all(
    updates.map(([key, value]) =>
      prisma.platformSetting.upsert({
        where:  { key },
        update: { value: String(value) },
        create: { key,  value: String(value) },
      })
    )
  );
  res.json({ message: 'Settings updated' });
}));

export default router;
