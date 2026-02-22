// src/modules/jobs/jobs.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate';
import * as svc from './jobs.service';

const router = Router();

const createJobSchema = z.object({
  title:               z.string().min(5).max(100),
  description:         z.string().min(20).max(2000),
  instructions:        z.string().min(20).max(2000),
  categoryId:          z.string(),
  budgetPerWorker:     z.number().min(0.01).max(1000),
  workersRequired:     z.number().int().min(1).max(10000),
  deadline:            z.string().datetime(),
  proofType:           z.enum(['TEXT', 'IMAGE', 'LINK', 'MIXED']),
  locationRestriction: z.string().optional(),
  tags:                z.array(z.string()).max(10).optional(),
});

const wrap = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

// Public / authenticated
router.get('/',         authenticate, wrap(async (req: any, res: any) => {
  const result = await svc.getJobs({
    page:       Number(req.query.page),
    limit:      Number(req.query.limit),
    category:   req.query.category as string,
    search:     req.query.search as string,
    minBudget:  Number(req.query.minBudget) || undefined,
    maxBudget:  Number(req.query.maxBudget) || undefined,
  });
  res.json(result);
}));

router.get('/saved',    authenticate, wrap(async (req: any, res: any) => {
  res.json(await svc.getSavedJobs(req.user.id));
}));

router.get('/my',       authenticate, wrap(async (req: any, res: any) => {
  const { prisma } = await import('../../config/database');
  const jobs = await prisma.job.findMany({
    where:   { employerId: req.user.id },
    include: { category: true, _count: { select: { submissions: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(jobs);
}));

router.get('/:id',      authenticate, wrap(async (req: any, res: any) => {
  res.json(await svc.getJobById(req.params.id, req.user.id));
}));

router.post('/',        authenticate, authorize('EMPLOYER', 'ADMIN', 'SUPER_ADMIN'),
  validate(createJobSchema), wrap(async (req: any, res: any) => {
    const job = await svc.createJob(req.user.id, req.body);
    res.status(201).json(job);
  }));

router.put('/:id',      authenticate, wrap(async (req: any, res: any) => {
  res.json(await svc.updateJob(req.params.id, req.user.id, req.body));
}));

// Pause/Resume
router.put('/:id/status', authenticate, wrap(async (req: any, res: any) => {
  const { prisma } = await import('../../config/database');
  const job = await prisma.job.findUnique({ where: { id: req.params.id } });
  if (!job || job.employerId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
  const newStatus = req.body.status;
  if (!['PAUSED', 'ACTIVE'].includes(newStatus)) return res.status(400).json({ error: 'Invalid status' });
  res.json(await prisma.job.update({ where: { id: req.params.id }, data: { status: newStatus } }));
}));

// Save / Unsave
router.post('/:id/save',   authenticate, wrap(async (req: any, res: any) => {
  res.json(await svc.saveJob(req.user.id, req.params.id));
}));
router.delete('/:id/save', authenticate, wrap(async (req: any, res: any) => {
  await svc.unsaveJob(req.user.id, req.params.id);
  res.json({ message: 'Unsaved' });
}));

// Admin actions
router.get('/admin',        authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'MODERATOR'),
  wrap(async (req: any, res: any) => {
    const { prisma } = await import('../../config/database');
    const status = req.query.status as string;
    const where: any = {};
    if (status) where.status = status;
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        category: { select: { name: true, slug: true, icon: true } },
        employer: { select: { id: true, username: true } },
        _count: { select: { submissions: true } },
      },
    });
    res.json(jobs);
  }));
  wrap(async (req: any, res: any) => {
    res.json(await svc.approveJob(req.params.id));
  }));

router.put('/:id/reject',  authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'MODERATOR'),
  wrap(async (req: any, res: any) => {
    await svc.rejectJob(req.params.id, req.body.reason || 'Does not meet guidelines');
    res.json({ message: 'Job rejected and employer refunded' });
  }));

export default router;
