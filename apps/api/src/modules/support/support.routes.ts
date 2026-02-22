// src/modules/support/support.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';
import { emitToUser } from '../../config/socket';

const router = Router();
const wrap   = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

router.post('/tickets', authenticate, wrap(async (req: any, res: any) => {
  const ticket = await prisma.supportTicket.create({
    data: {
      userId:  req.user.id,
      subject: req.body.subject,
      messages: {
        create: { senderId: req.user.id, message: req.body.message, isStaff: false },
      },
    },
    include: { messages: true },
  });
  res.status(201).json(ticket);
}));

router.get('/tickets/my', authenticate, wrap(async (req: any, res: any) => {
  const tickets = await prisma.supportTicket.findMany({
    where:   { userId: req.user.id },
    orderBy: { updatedAt: 'desc' },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });
  res.json(tickets);
}));

router.post('/tickets/:id/message', authenticate, wrap(async (req: any, res: any) => {
  const ticket = await prisma.supportTicket.findUniqueOrThrow({ where: { id: req.params.id } });
  const isStaff = ['ADMIN', 'SUPPORT_AGENT', 'SUPER_ADMIN', 'MODERATOR'].includes(req.user.role);

  // Non-staff can only reply to their own tickets
  if (!isStaff && ticket.userId !== req.user.id) {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const msg = await prisma.ticketMessage.create({
    data: { ticketId: req.params.id, senderId: req.user.id, message: req.body.message, isStaff },
  });

  await prisma.supportTicket.update({ where: { id: req.params.id }, data: { updatedAt: new Date() } });

  // Notify the other party
  const notifyId = isStaff ? ticket.userId : ticket.userId; // simplified
  emitToUser(notifyId, 'chat:message', { ticketId: req.params.id, message: msg });

  res.status(201).json(msg);
}));

// Admin: all tickets
router.get('/tickets/admin', authenticate,
  authorize('ADMIN', 'SUPER_ADMIN', 'SUPPORT_AGENT', 'MODERATOR'),
  wrap(async (req: any, res: any) => {
    const tickets = await prisma.supportTicket.findMany({
      where:   req.query.status ? { status: req.query.status as string } : {},
      orderBy: { updatedAt: 'desc' },
      include: { user: { select: { username: true, email: true } }, messages: { orderBy: { createdAt: 'asc' } } },
    });
    res.json(tickets);
  }));

router.put('/tickets/:id/status', authenticate,
  authorize('ADMIN', 'SUPER_ADMIN', 'SUPPORT_AGENT'),
  wrap(async (req: any, res: any) => {
    const t = await prisma.supportTicket.update({
      where: { id: req.params.id },
      data:  { status: req.body.status },
    });
    res.json(t);
  }));

export default router;
