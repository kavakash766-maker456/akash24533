// src/modules/reviews/reviews.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate';
import { prisma } from '../../config/database';

const router = Router();
const wrap   = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

const reviewSchema = z.object({
  reviewedId: z.string(),
  rating:     z.number().int().min(1).max(5),
  comment:    z.string().max(500).optional(),
  jobId:      z.string().optional(),
});

router.post('/', authenticate, validate(reviewSchema), wrap(async (req: any, res: any) => {
  if (req.body.reviewedId === req.user.id) {
    return res.status(400).json({ error: 'You cannot review yourself' });
  }
  const review = await prisma.review.create({
    data: { ...req.body, reviewerId: req.user.id },
  });
  res.status(201).json(review);
}));

router.get('/user/:userId', wrap(async (req: any, res: any) => {
  const reviews = await prisma.review.findMany({
    where:   { reviewedId: req.params.userId },
    include: { reviewer: { select: { username: true, avatarUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  res.json({ reviews, averageRating: avg, total: reviews.length });
}));

export default router;
