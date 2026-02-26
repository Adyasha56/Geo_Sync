import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './config/app.js';
import { initializeSocket } from './socket/index.js';
import redisService from './services/redis.js';

const PORT = parseInt(process.env.PORT || '3001');
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

async function bootstrap() {
  // 1. Connect to Redis (or fall back gracefully)
  await redisService.connect();

  // 2. Create Express app
  const app = createApp();

  // 3. Create HTTP server (needed to share with Socket.io)
  const httpServer = createServer(app);

  // 4. Attach Socket.io to the HTTP server
  const io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Socket.io tuning for low latency
    pingTimeout: 10000,      // 10s before considering connection dead
    pingInterval: 5000,      // Ping every 5s
    transports: ['websocket', 'polling'], // Prefer WebSocket, polling as fallback
    upgradeTimeout: 10000,
  });

  // 5. Register all socket handlers
  initializeSocket(io);

  // 6. Start listening
  httpServer.listen(PORT, () => {
    console.log(`
    GeoSync Server Running
    HTTP  : http://localhost:${PORT}       
    WS    : ws://localhost:${PORT}
    Redis : ${redisService.isRedisConnected ? 'Connected' : 'In-memory fallback'}   `);
  });

  //  shutdown 
  const shutdown = async (signal) => {
    console.log(`\n[Server] ${signal} received — shutting down gracefully...`);
    
    httpServer.close(async () => {
      await redisService.store?.quit?.();
      console.log('Server Shutdown complete.');
      process.exit(0);
    });

    // Force exit if graceful shutdown takes too long
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    console.error('[Server] Uncaught Exception:', err);
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[Server] Unhandled Rejection:', reason);
  });
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});