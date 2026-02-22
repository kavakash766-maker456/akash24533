// src/modules/jobs/jobs.service.ts
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import Decimal from 'decimal.js';

// ── Browse Jobs ────────────────────────────────────────────────────────────────
export async function getJobs(query: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minBudget?: number;
  maxBudget?: number;
  country?: string;
}) {
  const page  = Math.max(1, query.page || 1);
  const limit = Math.min(50, query.limit || 20);
  const skip  = (page - 1) * limit;

  const where: any = { status: 'ACTIVE' };

  if (query.category) where.category = { slug: query.category };
  if (query.search)   where.OR = [
    { title:       { contains: query.search, mode: 'insensitive' } },
    { description: { contains: query.search, mode: 'insensitive' } },
  ];
  if (query.minBudget) where.budgetPerWorker = { gte: query.minBudget };
  if (query.maxBudget) where.budgetPerWorker = { ...where.budgetPerWorker, lte: query.maxBudget };

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: {
        category: { select: { name: true, slug: true, icon: true } },
        employer: { select: { id: true, username: true, avatarUrl: true } },
        _count:   { select: { submissions: true } },
      },
    }),
    prisma.job.count({ where }),
  ]);

  return {
    data:  jobs,
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}

// ── Get Single Job ─────────────────────────────────────────────────────────────
export async function getJobById(jobId: string, userId?: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      category: true,
      employer: { select: { id: true, username: true, avatarUrl: true, createdAt: true } },
      _count:   { select: { submissions: true } },
    },
  });

  if (!job) throw new AppError('Job not found', 404);

  // Increment view count
  await prisma.job.update({ where: { id: jobId }, data: { views: { increment: 1 } } });

  // Check if user already submitted
  let hasSubmitted = false;
  if (userId) {
    const existing = await prisma.submission.findUnique({
      where: { jobId_workerId: { jobId, workerId: userId } },
    });
    hasSubmitted = !!existing;
  }

  return { ...job, hasSubmitted };
}

// ── Create Job ─────────────────────────────────────────────────────────────────
export async function createJob(employerId: string, data: {
  title: string;
  description: string;
  instructions: string;
  categoryId: string;
  budgetPerWorker: number;
  workersRequired: number;
  deadline: string;
  proofType: string;
  locationRestriction?: string;
  tags?: string[];
}) {
  // Check employer wallet balance
  const wallet = await prisma.wallet.findUnique({ where: { userId: employerId } });
  if (!wallet) throw new AppError('Wallet not found', 404);

  const total = new Decimal(data.budgetPerWorker).mul(data.workersRequired);

  // Check membership limits
  const employer = await prisma.user.findUniqueOrThrow({ where: { id: employerId } });
  const activeJobs = await prisma.job.count({
    where: { employerId, status: { in: ['ACTIVE', 'PENDING_REVIEW'] } },
  });

  const limits: Record<string, number> = { FREE: 3, PRO: 25, PREMIUM: Infinity };
  if (activeJobs >= limits[employer.membershipPlan]) {
    throw new AppError(`Your ${employer.membershipPlan} plan allows max ${limits[employer.membershipPlan]} active jobs. Please upgrade.`, 403);
  }

  // Check sufficient balance
  if (new Decimal(wallet.balance).lt(total)) {
    throw new AppError(`Insufficient balance. You need $${total.toFixed(2)} to post this job.`, 400);
  }

  // Create job + lock escrow in one transaction
  const [job] = await prisma.$transaction([
    prisma.job.create({
      data: {
        ...data,
        employerId,
        budgetPerWorker:  data.budgetPerWorker,
        workersRequired:  data.workersRequired,
        deadline:         new Date(data.deadline),
        proofType:        data.proofType as any,
        status:           'PENDING_REVIEW',
        escrowHeld:       total.toNumber(),
        tags:             data.tags || [],
      },
    }),
    prisma.wallet.update({
      where: { userId: employerId },
      data: {
        balance:       { decrement: total.toNumber() },
        escrowBalance: { increment: total.toNumber() },
      },
    }),
  ]);

  return job;
}

// ── Update Job ─────────────────────────────────────────────────────────────────
export async function updateJob(jobId: string, employerId: string, data: any) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError('Job not found', 404);
  if (job.employerId !== employerId) throw new AppError('Not authorized', 403);
  if (job.status === 'ACTIVE') throw new AppError('Cannot edit an active job. Pause it first.', 400);

  return prisma.job.update({ where: { id: jobId }, data });
}

// ── Approve/Reject Job (Admin) ────────────────────────────────────────────────
export async function approveJob(jobId: string) {
  return prisma.job.update({
    where: { id: jobId },
    data:  { status: 'ACTIVE' },
  });
}

export async function rejectJob(jobId: string, reason: string) {
  const job = await prisma.job.findUniqueOrThrow({ where: { id: jobId }, include: { employer: { include: { wallet: true } } } });

  // Refund employer
  await prisma.$transaction([
    prisma.job.update({ where: { id: jobId }, data: { status: 'CANCELLED', rejectionReason: reason } }),
    prisma.wallet.update({
      where: { userId: job.employerId },
      data: {
        balance:       { increment: Number(job.escrowHeld) },
        escrowBalance: { decrement: Number(job.escrowHeld) },
      },
    }),
  ]);
}

// ── Save/Unsave Job ────────────────────────────────────────────────────────────
export async function saveJob(userId: string, jobId: string) {
  return prisma.savedJob.create({ data: { userId, jobId } }).catch(() => {
    throw new AppError('Job already saved', 400);
  });
}

export async function unsaveJob(userId: string, jobId: string) {
  await prisma.savedJob.delete({ where: { userId_jobId: { userId, jobId } } });
}

export async function getSavedJobs(userId: string) {
  return prisma.savedJob.findMany({
    where: { userId },
    include: { job: { include: { category: true, employer: { select: { username: true, avatarUrl: true } } } } },
    orderBy: { savedAt: 'desc' },
  });
}
