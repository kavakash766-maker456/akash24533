// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import * as authService from './auth.service';

export async function register(req: Request, res: Response) {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const deviceInfo = req.headers['user-agent'];
  const ipAddress  = req.ip;
  const result = await authService.loginUser(email, password, deviceInfo, ipAddress);
  res.json(result);
}

export async function verify2FA(req: Request, res: Response) {
  const result = await authService.verify2FA(req.body.tempToken, req.body.otp);
  res.json(result);
}

export async function refresh(req: Request, res: Response) {
  const result = await authService.refreshTokens(req.body.refreshToken);
  res.json(result);
}

export async function logout(req: Request, res: Response) {
  await authService.logoutUser(req.body.refreshToken);
  res.json({ message: 'Logged out successfully' });
}

export async function verifyEmail(req: Request, res: Response) {
  const result = await authService.verifyEmail(req.body.token);
  res.json(result);
}

export async function forgotPassword(req: Request, res: Response) {
  const result = await authService.requestPasswordReset(req.body.email);
  res.json(result);
}

export async function resetPassword(req: Request, res: Response) {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  res.json(result);
}

export async function setup2FA(req: Request, res: Response) {
  const result = await authService.setup2FA(req.user.id);
  res.json(result);
}

export async function enable2FA(req: Request, res: Response) {
  const result = await authService.enable2FA(req.user.id, req.body.otp);
  res.json(result);
}

export async function getSessions(req: Request, res: Response) {
  const { prisma } = await import('../../config/database');
  const sessions = await prisma.userSession.findMany({
    where: { userId: req.user.id },
    orderBy: { lastActive: 'desc' },
    select: { id: true, deviceInfo: true, ipAddress: true, lastActive: true, createdAt: true },
  });
  res.json(sessions);
}

export async function revokeSession(req: Request, res: Response) {
  const { prisma } = await import('../../config/database');
  await prisma.userSession.deleteMany({
    where: { id: req.params.id, userId: req.user.id },
  });
  res.json({ message: 'Session revoked' });
}
