// src/modules/submissions/submissions.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import * as svc from './submissions.service';

const router = Router();
const wrap = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

router.post('/',              authenticate, wrap(async (req: any, res: any) => {
  const sub = await svc.submitProof(req.user.id, req.body);
  res.status(201).json(sub);
}));

router.get('/my',             authenticate, wrap(async (req: any, res: any) => {
  res.json(await svc.getWorkerSubmissions(req.user.id, Number(req.query.page), Number(req.query.limit)));
}));

router.get('/job/:jobId',     authenticate, wrap(async (req: any, res: any) => {
  res.json(await svc.getJobSubmissions(req.params.jobId, req.user.id));
}));

router.put('/:id/approve',    authenticate, wrap(async (req: any, res: any) => {
  res.json(await svc.approveSubmission(req.params.id, req.user.id));
}));

router.put('/:id/reject',     authenticate, wrap(async (req: any, res: any) => {
  res.json(await svc.rejectSubmission(req.params.id, req.user.id, req.body.feedback || ''));
}));

// Admin override
router.put('/:id/override',   authenticate, authorize('ADMIN', 'SUPER_ADMIN'),
  wrap(async (req: any, res: any) => {
    const { prisma } = await import('../../config/database');
    const sub = await prisma.submission.update({
      where: { id: req.params.id },
      data:  { status: req.body.status, feedback: req.body.feedback },
    });
    res.json(sub);
  }));

router.get('/admin',          authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'MODERATOR'),
  wrap(async (req: any, res: any) => {
    const { prisma } = await import('../../config/database');
    const subs = await prisma.submission.findMany({
      take:    50,
      orderBy: { submittedAt: 'desc' },
      include: { job: { select: { title: true } }, worker: { select: { username: true } } },
    });
    res.json(subs);
  }));

export default router;
