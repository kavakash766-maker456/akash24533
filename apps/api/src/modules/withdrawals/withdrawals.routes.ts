// src/modules/withdrawals/withdrawals.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import Decimal from 'decimal.js';

const router = Router();
const wrap   = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

// ── Request withdrawal ────────────────────────────────────────────────────────
router.post('/', authenticate, wrap(async (req: any, res: any) => {
  const { amount, method, accountDetails } = req.body;

  const feeSetting = await prisma.platformSetting.findUnique({ where: { key: 'withdrawal_fee_percent' } });
  const minSetting = await prisma.platformSetting.findUnique({ where: { key: 'min_withdrawal_amount' } });

  const feePct = Number(feeSetting?.value || 2);
  const minAmt = Number(minSetting?.value || 5);

  if (!amount || amount < minAmt) throw new AppError(`Minimum withdrawal is $${minAmt}`, 400);

  const gross   = new Decimal(amount);
  const fee     = gross.mul(feePct).div(100);
  const net     = gross.minus(fee);

  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
  if (!wallet || new Decimal(wallet.balance).lt(gross)) {
    throw new AppError('Insufficient balance', 400);
  }

  const withdrawal = await prisma.$transaction(async (tx) => {
    // Deduct from wallet
    await tx.wallet.update({
      where: { userId: req.user.id },
      data:  { balance: { decrement: gross.toNumber() } },
    });

    // Create withdrawal request
    return tx.withdrawal.create({
      data: {
        userId:         req.user.id,
        amount:         gross.toNumber(),
        fee:            fee.toNumber(),
        netAmount:      net.toNumber(),
        method,
        accountDetails,
      },
    });
  });

  res.status(201).json(withdrawal);
}));

// ── My withdrawals ────────────────────────────────────────────────────────────
router.get('/my', authenticate, wrap(async (req: any, res: any) => {
  const withdrawals = await prisma.withdrawal.findMany({
    where:   { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json(withdrawals);
}));

// ── Admin: all withdrawals ────────────────────────────────────────────────────
router.get('/admin', authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  wrap(async (req: any, res: any) => {
    const status = req.query.status as string;
    const withdrawals = await prisma.withdrawal.findMany({
      where:   status ? { status: status as any } : {},
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { username: true, email: true } } },
    });
    res.json(withdrawals);
  }));

// ── Admin: approve ────────────────────────────────────────────────────────────
router.put('/:id/approve', authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  wrap(async (req: any, res: any) => {
    const w = await prisma.withdrawal.update({
      where: { id: req.params.id },
      data:  { status: 'APPROVED' },
    });
    res.json(w);
  }));

// ── Admin: reject (refund user) ───────────────────────────────────────────────
router.put('/:id/reject', authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  wrap(async (req: any, res: any) => {
    const w = await prisma.withdrawal.findUniqueOrThrow({ where: { id: req.params.id } });

    await prisma.$transaction([
      prisma.withdrawal.update({
        where: { id: req.params.id },
        data:  { status: 'REJECTED', adminNote: req.body.note },
      }),
      // Refund the amount back to user wallet
      prisma.wallet.update({
        where: { userId: w.userId },
        data:  { balance: { increment: Number(w.amount) } },
      }),
    ]);

    res.json({ message: 'Withdrawal rejected and refunded' });
  }));

// ── Admin: mark as paid ───────────────────────────────────────────────────────
router.put('/:id/paid', authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  wrap(async (req: any, res: any) => {
    const w = await prisma.withdrawal.update({
      where: { id: req.params.id },
      data:  { status: 'PAID', processedAt: new Date() },
    });
    res.json(w);
  }));

export default router;
