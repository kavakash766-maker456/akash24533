// src/server.ts
// Starts the HTTP server and Socket.io

import 'dotenv/config';
import http from 'http';
import app from './app';
import { initSocket } from './config/socket';
import { prisma } from './config/database';
import { redis } from './config/redis';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Test Redis connection
    await redis.ping();
    console.log('✅ Redis connected');

    // Create HTTP server
    const server = http.createServer(app);

    // Attach Socket.io
    initSocket(server);
    console.log('✅ Socket.io initialized');

    // Start listening
    server.listen(PORT, () => {
      console.log(`\n🚀 TaskEarn Pro API running on port ${PORT}`);
      console.log(`📖 API Docs: http://localhost:${PORT}/api/docs`);
      console.log(`❤️  Health:   http://localhost:${PORT}/health\n`);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  redis.disconnect();
  process.exit(0);
});
