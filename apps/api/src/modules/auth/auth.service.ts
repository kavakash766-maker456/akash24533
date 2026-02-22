// src/modules/auth/auth.service.ts
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../config/mailer';
import { AppError } from '../../middleware/errorHandler';

// ── Register ──────────────────────────────────────────────────────────────────
export async function registerUser(data: {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
}) {
  // Check duplicates
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: data.email }, { username: data.username }] },
  });
  if (existing) {
    throw new AppError(
      existing.email === data.email ? 'Email already registered' : 'Username already taken',
      409
    );
  }

  // Find referrer
  let referredById: string | undefined;
  if (data.referralCode) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: data.referralCode } });
    if (referrer) referredById = referrer.id;
  }

  const passwordHash  = await bcrypt.hash(data.password, 12);
  const myReferralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

  const user = await prisma.user.create({
    data: {
      email:        data.email,
      username:     data.username,
      passwordHash,
      firstName:    data.firstName,
      lastName:     data.lastName,
      referralCode: myReferralCode,
      referredById,
      wallet:       { create: {} }, // auto-create wallet
    },
  });

  // Send verification email
  const verifyToken = crypto.randomBytes(32).toString('hex');
  await prisma.emailVerification.create({
    data: {
      email:     user.email,
      token:     verifyToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });
  await sendVerificationEmail(user.email, verifyToken);

  return { message: 'Registration successful! Please check your email to verify your account.' };
}

// ── Login ─────────────────────────────────────────────────────────────────────
export async function loginUser(
  email: string,
  password: string,
  deviceInfo?: string,
  ipAddress?: string
) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new AppError('Invalid email or password', 401);

  if (user.status === 'BANNED')      throw new AppError('Your account has been banned', 403);
  if (user.status === 'SUSPENDED')   throw new AppError('Your account is suspended', 403);

  // If 2FA is enabled, return a partial token instead
  if (user.twoFactorEnabled) {
    const tempToken = crypto.randomBytes(32).toString('hex');
    await redis.setex(`2fa:${tempToken}`, 300, user.id); // 5 min
    return { requires2FA: true, tempToken };
  }

  return createSession(user, deviceInfo, ipAddress);
}

// ── 2FA Verify ────────────────────────────────────────────────────────────────
export async function verify2FA(tempToken: string, otp: string) {
  const userId = await redis.get(`2fa:${tempToken}`);
  if (!userId) throw new AppError('2FA session expired', 401);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const valid = authenticator.verify({ token: otp, secret: user.twoFactorSecret! });
  if (!valid) throw new AppError('Invalid 2FA code', 401);

  await redis.del(`2fa:${tempToken}`);
  return createSession(user);
}

// ── Refresh Tokens ────────────────────────────────────────────────────────────
export async function refreshTokens(refreshToken: string) {
  // Check if blacklisted (logged out)
  const blacklisted = await redis.get(`bl_rt:${refreshToken}`);
  if (blacklisted) throw new AppError('Token revoked', 401);

  const session = await prisma.userSession.findUnique({
    where: { refreshToken },
    include: { user: true },
  });
  if (!session || session.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Rotate: delete old, create new
  await prisma.userSession.delete({ where: { refreshToken } });
  return createSession(session.user);
}

// ── Logout ────────────────────────────────────────────────────────────────────
export async function logoutUser(refreshToken: string) {
  // Blacklist the refresh token
  await redis.setex(`bl_rt:${refreshToken}`, 30 * 24 * 3600, '1');
  await prisma.userSession.deleteMany({ where: { refreshToken } });
}

// ── Email Verification ────────────────────────────────────────────────────────
export async function verifyEmail(token: string) {
  const record = await prisma.emailVerification.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) {
    throw new AppError('Invalid or expired verification link', 400);
  }

  await prisma.user.updateMany({
    where: { email: record.email },
    data:  { isEmailVerified: true, status: 'ACTIVE' },
  });
  await prisma.emailVerification.delete({ where: { token } });

  return { message: 'Email verified successfully!' };
}

// ── Password Reset ────────────────────────────────────────────────────────────
export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Don't reveal if email exists
  if (!user) return { message: 'If that email exists, a reset link has been sent.' };

  const token = crypto.randomBytes(32).toString('hex');
  await prisma.passwordReset.create({
    data: { email, token, expiresAt: new Date(Date.now() + 3600000) }, // 1h
  });
  await sendPasswordResetEmail(email, token);

  return { message: 'If that email exists, a reset link has been sent.' };
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await prisma.passwordReset.findUnique({ where: { token } });
  if (!record || record.used || record.expiresAt < new Date()) {
    throw new AppError('Invalid or expired reset link', 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.updateMany({ where: { email: record.email }, data: { passwordHash } });
  await prisma.passwordReset.update({ where: { token }, data: { used: true } });

  return { message: 'Password reset successfully!' };
}

// ── 2FA Setup ─────────────────────────────────────────────────────────────────
export async function setup2FA(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const secret = authenticator.generateSecret();
  const otpAuthUrl = authenticator.keyuri(user.email, 'TaskEarn Pro', secret);
  const qrCodeUrl  = await qrcode.toDataURL(otpAuthUrl);

  // Store secret temporarily — enable only after user verifies
  await redis.setex(`2fa_setup:${userId}`, 600, secret); // 10 min

  return { secret, qrCodeUrl };
}

export async function enable2FA(userId: string, otp: string) {
  const secret = await redis.get(`2fa_setup:${userId}`);
  if (!secret) throw new AppError('2FA setup session expired', 400);

  const valid = authenticator.verify({ token: otp, secret });
  if (!valid) throw new AppError('Invalid OTP code', 400);

  await prisma.user.update({
    where: { id: userId },
    data:  { twoFactorSecret: secret, twoFactorEnabled: true },
  });
  await redis.del(`2fa_setup:${userId}`);

  return { message: '2FA enabled successfully!' };
}

// ── Helper: create session & return tokens ────────────────────────────────────
async function createSession(
  user: any,
  deviceInfo?: string,
  ipAddress?: string
) {
  const accessToken  = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  await prisma.userSession.create({
    data: {
      userId:       user.id,
      refreshToken,
      deviceInfo,
      ipAddress,
      expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    },
  });

  // Update last active
  await prisma.activityLog.create({
    data: { userId: user.id, action: 'LOGIN', ipAddress },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id:         user.id,
      email:      user.email,
      username:   user.username,
      firstName:  user.firstName,
      lastName:   user.lastName,
      role:       user.role,
      avatarUrl:  user.avatarUrl,
      membershipPlan: user.membershipPlan,
    },
  };
}
