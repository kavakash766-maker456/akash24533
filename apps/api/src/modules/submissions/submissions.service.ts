// src/modules/submissions/submissions.service.ts
import Decimal from 'decimal.js';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';
import { emitToUser } from '../../config/socket';
import { sendSubmissionResultEmail } from '../../config/mailer';

// ── Submit Proof ───────────────────────────────────────────────────────────────
export async function submitProof(workerId: string, data: {
  jobId: string;
  proofText?: string;
  proofImageUrl?: string;
  proofLink?: string;
}) {
  const job = await prisma.job.findUnique({ where: { id: data.jobId } });
  if (!job) throw new AppError('Job not found', 404);
  if (job.status !== 'ACTIVE') throw new AppError('This job is no longer accepting submissions', 400);
  if (job.workersCompleted >= job.workersRequired) throw new AppError('Job is full', 400);

  // Prevent self-submission
  if (job.employerId === workerId) throw new AppError('You cannot submit to your own job', 403);

  // Check duplicate
  const existing = await prisma.submission.findUnique({
    where: { jobId_workerId: { jobId: data.jobId, workerId } },
  });
  if (existing) throw new AppError('You already submitted for this job', 409);

  // Proof validation
  if (job.proofType === 'TEXT'  && !data.proofText)     throw new AppError('Text proof required', 400);
  if (job.proofType === 'IMAGE' && !data.proofImageUrl) throw new AppError('Image proof required', 400);
  if (job.proofType === 'LINK'  && !data.proofLink)     throw new AppError('Link proof required', 400);

  const submission = await prisma.submission.create({
    data: { ...data, workerId },
  });

  // Notify employer
  emitToUser(job.employerId, 'submission:new', {
    jobId:  job.id,
    jobTitle: job.title,
    workerId,
  });

  return submission;
}

// ── Approve Submission ─────────────────────────────────────────────────────────
export async function approveSubmission(submissionId: string, employerId: string) {
  const submission = await prisma.submission.findUnique({
    where:   { id: submissionId },
    include: { job: true, worker: { include: { wallet: true } } },
  });
  if (!submission)              throw new AppError('Submission not found', 404);
  if (submission.status !== 'PENDING') throw new AppError('Submission already reviewed', 400);
  if (submission.job.employerId !== employerId) throw new AppError('Not authorized', 403);

  // Get platform commission from settings
  const commissionSetting = await prisma.platformSetting.findUnique({ where: { key: 'platform_commission_percent' } });
  const commissionPct = Number(commissionSetting?.value || 10);

  const gross      = new Decimal(submission.job.budgetPerWorker);
  const commission = gross.mul(commissionPct).div(100);
  const net        = gross.minus(commission);

  await prisma.$transaction([
    // Mark approved + set earnings
    prisma.submission.update({
      where: { id: submissionId },
      data:  { status: 'APPROVED', earnings: net.toNumber(), reviewedAt: new Date() },
    }),
    // Deduct from employer escrow
    prisma.wallet.update({
      where: { userId: employerId },
      data:  { escrowBalance: { decrement: gross.toNumber() } },
    }),
    // Credit worker wallet
    prisma.wallet.update({
      where: { userId: submission.workerId },
      data:  { balance: { increment: net.toNumber() }, totalEarned: { increment: net.toNumber() } },
    }),
    // Increment completed count on job
    prisma.job.update({
      where: { id: submission.jobId },
      data:  { workersCompleted: { increment: 1 } },
    }),
    // Record transaction for worker
    prisma.transaction.create({
      data: {
        walletId:    submission.worker.wallet!.id,
        type:        'EARNING',
        status:      'COMPLETED',
        amount:      gross.toNumber(),
        fee:         commission.toNumber(),
        netAmount:   net.toNumber(),
        description: `Earnings from: ${submission.job.title}`,
        reference:   submissionId,
      },
    }),
  ]);

  // Notify worker (real-time + email)
  emitToUser(submission.workerId, 'submission:status', {
    submissionId,
    status:   'APPROVED',
    earnings: net.toNumber(),
  });
  sendSubmissionResultEmail(
    submission.worker.email,
    submission.job.title,
    'approved',
    net.toNumber()
  );

  return { message: 'Submission approved', earnings: net.toNumber() };
}

// ── Reject Submission ──────────────────────────────────────────────────────────
export async function rejectSubmission(submissionId: string, employerId: string, feedback: string) {
  const submission = await prisma.submission.findUnique({
    where:   { id: submissionId },
    include: { job: true, worker: true },
  });
  if (!submission)              throw new AppError('Submission not found', 404);
  if (submission.status !== 'PENDING') throw new AppError('Submission already reviewed', 400);
  if (submission.job.employerId !== employerId) throw new AppError('Not authorized', 403);

  await prisma.submission.update({
    where: { id: submissionId },
    data:  { status: 'REJECTED', feedback, reviewedAt: new Date() },
  });

  // Notify worker
  emitToUser(submission.workerId, 'submission:status', { submissionId, status: 'REJECTED', feedback });
  sendSubmissionResultEmail(submission.worker.email, submission.job.title, 'rejected', undefined, feedback);

  return { message: 'Submission rejected' };
}

// ── List Submissions ───────────────────────────────────────────────────────────
export async function getWorkerSubmissions(workerId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.submission.findMany({
      where:   { workerId },
      skip,
      take:    limit,
      orderBy: { submittedAt: 'desc' },
      include: { job: { include: { category: true, employer: { select: { username: true } } } } },
    }),
    prisma.submission.count({ where: { workerId } }),
  ]);
  return { data: items, total, page, pages: Math.ceil(total / limit) };
}

export async function getJobSubmissions(jobId: string, employerId: string) {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job || job.employerId !== employerId) throw new AppError('Not authorized', 403);
  return prisma.submission.findMany({
    where:   { jobId },
    include: { worker: { select: { id: true, username: true, avatarUrl: true, country: true } } },
    orderBy: { submittedAt: 'desc' },
  });
}
