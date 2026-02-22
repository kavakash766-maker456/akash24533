// src/modules/categories/categories.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';

const router = Router();
const wrap   = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

router.get('/', wrap(async (_req: any, res: any) => {
  const cats = await prisma.category.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
  res.json(cats);
}));

router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), wrap(async (req: any, res: any) => {
  const cat = await prisma.category.create({ data: req.body });
  res.status(201).json(cat);
}));

export default router;
