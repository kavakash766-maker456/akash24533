// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public message: string, public statusCode: number = 400) {
    super(message);
  }
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Known application error
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Record already exists' });
  }

  // Prisma not found
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }

  // Zod validation error
  if (err.name === 'ZodError') {
    return res.status(422).json({
      error: 'Validation failed',
      details: err.errors,
    });
  }

  // Unknown error — log and return generic message
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
}
