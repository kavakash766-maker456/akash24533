// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { z } from 'zod';
import * as ctrl from './auth.controller';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

const registerSchema = z.object({
  email:        z.string().email(),
  username:     z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers, underscores only'),
  password:     z.string().min(8, 'Password must be at least 8 characters'),
  firstName:    z.string().min(1).max(50),
  lastName:     z.string().min(1).max(50),
  referralCode: z.string().optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

const tokenSchema    = z.object({ token:        z.string() });
const passwordSchema = z.object({ token: z.string(), password: z.string().min(8) });
const otpSchema      = z.object({ otp:          z.string().length(6) });
const twoFASchema    = z.object({ tempToken: z.string(), otp: z.string().length(6) });

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, username, password, firstName, lastName]
 *             properties:
 *               email:     { type: string, format: email }
 *               username:  { type: string, minLength: 3 }
 *               password:  { type: string, minLength: 8 }
 *               firstName: { type: string }
 *               lastName:  { type: string }
 */
router.post('/register',           validate(registerSchema),  ctrl.register);
router.post('/login',              validate(loginSchema),     ctrl.login);
router.post('/2fa/verify',         validate(twoFASchema),     ctrl.verify2FA);
router.post('/refresh',            ctrl.refresh);
router.post('/logout',             ctrl.logout);
router.post('/verify-email',       validate(tokenSchema),     ctrl.verifyEmail);
router.post('/forgot-password',    ctrl.forgotPassword);
router.post('/reset-password',     validate(passwordSchema),  ctrl.resetPassword);
router.post('/2fa/setup',          authenticate,              ctrl.setup2FA);
router.post('/2fa/enable',         authenticate, validate(otpSchema), ctrl.enable2FA);
router.get( '/sessions',           authenticate,              ctrl.getSessions);
router.delete('/sessions/:id',     authenticate,              ctrl.revokeSession);
router.post('/change-password',    authenticate, async (req: any, res: any, next: any) => {
  try {
    const { changePassword } = await import('./auth.changepassword');
    const result = await changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    res.json(result);
  } catch (e) { next(e); }
});

export default router;
