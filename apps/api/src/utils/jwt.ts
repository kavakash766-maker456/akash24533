// src/utils/jwt.ts
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function generateAccessToken(userId: string, role: string): string {
  return jwt.sign(
    { sub: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    { sub: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '30d' }
  );
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
}
