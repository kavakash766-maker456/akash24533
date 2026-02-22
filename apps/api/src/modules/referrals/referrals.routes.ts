// src/modules/referrals/referrals.routes.ts
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';

const router = Router();
const wrap   = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

router.get('/link', authenticate, wrap(async (req: any, res: any) => {
  const user = await prisma.user.findUniqueOrThrow({
    where:  { id: req.user.id },
    select: { referralCode: true },
  });
  const link = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;
  res.json({ referralCode: user.referralCode, link });
}));

router.get('/my', authenticate, wrap(async (req: any, res: any) => {
  const referrals = await prisma.user.findMany({
    where:  { referredById: req.user.id },
    select: { id: true, username: true, createdAt: true, membershipPlan: true },
    orderBy: { createdAt: 'desc' },
  });

  const bonusTransactions = await prisma.transaction.findMany({
    where: {
      type:   'REFERRAL_BONUS',
      wallet: { userId: req.user.id },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalBonus = bonusTransactions.reduce((sum, t) => sum + Number(t.amount), 0);

  res.json({ referrals, totalBonus, bonusTransactions });
}));

export default router;
