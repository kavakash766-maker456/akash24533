// Append to auth.routes.ts — change password endpoint
// This is imported and merged in auth.routes.ts

import bcrypt from 'bcrypt';
import { prisma } from '../../config/database';
import { AppError } from '../../middleware/errorHandler';

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.passwordHash) throw new AppError('No password set (Google login). Use forgot password instead.', 400);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new AppError('Current password is incorrect', 401);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { message: 'Password changed successfully' };
}
