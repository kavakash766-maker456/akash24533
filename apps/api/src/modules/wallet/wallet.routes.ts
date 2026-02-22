// src/modules/wallet/wallet.routes.ts
import { Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';

const router  = Router();
const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const wrap    = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

// ── Get wallet ────────────────────────────────────────────────────────────────
router.get('/', authenticate, wrap(async (req: any, res: any) => {
  const wallet = await prisma.wallet.findUnique({
    where: { userId: req.user.id },
  });
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
  res.json(wallet);
}));

// ── Transaction history ───────────────────────────────────────────────────────
router.get('/transactions', authenticate, wrap(async (req: any, res: any) => {
  const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } });
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

  const page  = Math.max(1, Number(req.query.page) || 1);
  const limit = 20;
  const skip  = (page - 1) * limit;

  const [txns, total] = await Promise.all([
    prisma.transaction.findMany({
      where:   { walletId: wallet.id },
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.count({ where: { walletId: wallet.id } }),
  ]);

  res.json({ data: txns, total, page, pages: Math.ceil(total / limit) });
}));

// ── Create Stripe payment intent (deposit) ────────────────────────────────────
router.post('/deposit', authenticate, wrap(async (req: any, res: any) => {
  const { amount } = req.body; // amount in USD
  if (!amount || amount < 1) return res.status(400).json({ error: 'Minimum deposit is $1' });
  if (amount > 10000)        return res.status(400).json({ error: 'Maximum deposit is $10,000' });

  const intent = await stripe.paymentIntents.create({
    amount:   Math.round(amount * 100), // Stripe uses cents
    currency: 'usd',
    metadata: { userId: req.user.id, type: 'deposit' },
  });

  res.json({ clientSecret: intent.client_secret });
}));

// ── Stripe webhook — called by Stripe when payment succeeds ───────────────────
router.post('/deposit/webhook', async (req: any, res: any) => {
  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    const userId  = intent.metadata.userId;
    const amount  = intent.amount / 100; // convert cents → dollars

    const wallet = await prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) return res.status(400).json({ error: 'Wallet not found' });

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId },
        data:  { balance: { increment: amount } },
      }),
      prisma.transaction.create({
        data: {
          walletId:    wallet.id,
          type:        'DEPOSIT',
          status:      'COMPLETED',
          amount,
          fee:         0,
          netAmount:   amount,
          description: 'Wallet deposit via Stripe',
          reference:   intent.id,
        },
      }),
    ]);
  }

  res.json({ received: true });
});

export default router;
