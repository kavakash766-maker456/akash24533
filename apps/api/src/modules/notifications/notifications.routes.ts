// src/modules/notifications/notifications.routes.ts
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';

const router = Router();
const wrap   = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

router.get('/', authenticate, wrap(async (req: any, res: any) => {
  const notifs = await prisma.notification.findMany({
    where:   { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    take:    50,
  });
  res.json(notifs);
}));

router.put('/:id/read', authenticate, wrap(async (req: any, res: any) => {
  await prisma.notification.update({
    where: { id: req.params.id },
    data:  { isRead: true },
  });
  res.json({ message: 'Marked as read' });
}));

router.put('/read-all', authenticate, wrap(async (req: any, res: any) => {
  await prisma.notification.updateMany({
    where: { userId: req.user.id, isRead: false },
    data:  { isRead: true },
  });
  res.json({ message: 'All notifications marked as read' });
}));

export default router;
