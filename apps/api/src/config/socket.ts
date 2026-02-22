// src/config/socket.ts
import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';

let io: Server;

export function initSocket(httpServer: any) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Authenticate every socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token provided'));
    try {
      const user = verifyAccessToken(token);
      socket.data.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.sub;

    // Each user joins their own private room
    socket.join(`user:${userId}`);
    console.log(`Socket connected: user ${userId}`);

    // Workers can join job rooms to get live updates
    socket.on('join:job', (jobId: string) => socket.join(`job:${jobId}`));
    socket.on('leave:job', (jobId: string) => socket.leave(`job:${jobId}`));

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: user ${userId}`);
    });
  });

  return io;
}

// Helper: send event to a specific user
export const emitToUser = (userId: string, event: string, data: any) => {
  io?.to(`user:${userId}`).emit(event, data);
};

// Helper: broadcast to all connected clients
export const broadcast = (event: string, data: any) => {
  io?.emit(event, data);
};

export { io };
