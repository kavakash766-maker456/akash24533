// src/modules/memberships/memberships.routes.ts
import { Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const wrap   = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

const PLANS: Record<string, { price: number; label: string }> = {
  PRO:     { price: 9.99,  label: 'Pro Plan'     },
  PREMIUM: { price: 24.99, label: 'Premium Plan'  },
};

router.get('/plans', (_req, res) => {
  res.json([
    { id: 'FREE',    name: 'Free',    price: 0,     features: ['3 active jobs', '50 workers/job', 'Basic support'] },
    { id: 'PRO',     name: 'Pro',     price: 9.99,  features: ['25 active jobs', '500 workers/job', '1 featured slot/month', 'Priority support'] },
    { id: 'PREMIUM', name: 'Premium', price: 24.99, features: ['Unlimited jobs', 'Unlimited workers', '3 featured slots/month', '24h priority support', 'Full analytics'] },
  ]);
});

router.post('/subscribe', authenticate, wrap(async (req: any, res: any) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return res.status(400).json({ error: 'Invalid plan' });

  const { price, label } = PLANS[plan];
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
  if (!wallet || Number(wallet.balance) < price) {
    return res.status(400).json({ error: `Insufficient balance. Need $${price} for ${label}.` });
  }

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 1); // 1 month

  await prisma.$transaction([
    prisma.wallet.update({
      where: { userId: req.user.id },
      data:  { balance: { decrement: price } },
    }),
    prisma.user.update({
      where: { id: req.user.id },
      data:  { membershipPlan: plan as any, membershipExpiry: expiry },
    }),
    prisma.transaction.create({
      data: {
        walletId:    wallet.id,
        type:        'MEMBERSHIP_PAYMENT',
        status:      'COMPLETED',
        amount:      price,
        fee:         0,
        netAmount:   price,
        description: `${label} subscription`,
      },
    }),
  ]);

  res.json({ message: `${label} activated until ${expiry.toLocaleDateString()}` });
}));

export default router;
