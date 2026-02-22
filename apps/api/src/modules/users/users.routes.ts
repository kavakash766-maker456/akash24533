// src/modules/users/users.routes.ts
import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { prisma } from '../../config/database';
import { uploadToCloudinary } from '../../config/cloudinary';
import multer from 'multer';

const router  = Router();
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const wrap    = (fn: Function) => (req: any, res: any, next: any) =>
  Promise.resolve(fn(req, res)).catch(next);

// ── My profile ────────────────────────────────────────────────────────────────
router.get('/me', authenticate, wrap(async (req: any, res: any) => {
  const user = await prisma.user.findUnique({
    where:  { id: req.user.id },
    select: { id: true, email: true, username: true, firstName: true, lastName: true,
              avatarUrl: true, role: true, status: true, country: true, bio: true,
              membershipPlan: true, referralCode: true, createdAt: true,
              wallet: { select: { balance: true, totalEarned: true } } },
  });
  res.json(user);
}));

router.put('/me', authenticate, wrap(async (req: any, res: any) => {
  const { firstName, lastName, bio, country } = req.body;
  const user = await prisma.user.update({
    where: { id: req.user.id },
    data:  { firstName, lastName, bio, country },
  });
  res.json(user);
}));

// ── Avatar upload ─────────────────────────────────────────────────────────────
router.post('/me/avatar', authenticate, upload.single('avatar'), wrap(async (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = await uploadToCloudinary(req.file.buffer, 'avatars', req.user.id);
  await prisma.user.update({ where: { id: req.user.id }, data: { avatarUrl: url } });
  res.json({ avatarUrl: url });
}));

// ── Public profile ────────────────────────────────────────────────────────────
router.get('/:id/public', wrap(async (req: any, res: any) => {
  const user = await prisma.user.findUnique({
    where:  { id: req.params.id },
    select: { id: true, username: true, avatarUrl: true, bio: true, country: true, createdAt: true,
              membershipPlan: true, _count: { select: { jobsPosted: true, submissions: true } } },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}));

// ── Admin: user management ────────────────────────────────────────────────────
router.get('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), wrap(async (req: any, res: any) => {
  const page  = Math.max(1, Number(req.query.page) || 1);
  const limit = 20;
  const skip  = (page - 1) * limit;
  const search = req.query.search as string;

  const where: any = {};
  if (search) where.OR = [
    { email:    { contains: search, mode: 'insensitive' } },
    { username: { contains: search, mode: 'insensitive' } },
  ];

  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, username: true, role: true, status: true,
                membershipPlan: true, createdAt: true, wallet: { select: { balance: true } } } }),
    prisma.user.count({ where }),
  ]);
  res.json({ data: users, total, page, pages: Math.ceil(total / limit) });
}));

router.put('/:id/status', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), wrap(async (req: any, res: any) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data:  { status: req.body.status },
  });
  res.json(user);
}));

router.put('/:id/role', authenticate, authorize('SUPER_ADMIN'), wrap(async (req: any, res: any) => {
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data:  { role: req.body.role },
  });
  res.json(user);
}));

export default router;
