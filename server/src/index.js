import 'dotenv/config';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createApp } from './config/app.js';
import { initializeSocket } from './socket/index.js';
import redisService from './services/redis.js';

const PORT = parseInt(process.env.PORT || '3001');

// Allowed origins — in production this will be your Vercel URL
// Multiple origins supported: set CLIENT_URL as comma-separated values
// e.g. CLIENT_URL=https://geosync.vercel.app,https://geosync-preview.vercel.app
const rawOrigins = process.env.CLIENT_URL || 'http://localhost:5173';
const ALLOWED_ORIGINS = rawOrigins.split(',').map(o => o.trim());

async function bootstrap() {
  await redisService.connect();

  const app = createApp(ALLOWED_ORIGINS);
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 10000,
    pingInterval: 5000,
    transports: ['websocket', 'polling'],
    upgradeTimeout: 10000,
  });

  initializeSocket(io);

  httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║         GeoSync Server Running         ║
╠════════════════════════════════════════╣
║  PORT   : ${PORT}                          ║
║  Redis  : ${redisService.isRedisConnected ? '✓ Connected         ' : '⚠ In-memory fallback'}      ║
║  Origins: ${ALLOWED_ORIGINS[0].slice(0, 30).padEnd(30)}  ║
╚════════════════════════════════════════╝
    `);
  });

  const shutdown = async (signal) => {
    console.log(`\n[Server] ${signal} received — shutting down...`);
    httpServer.close(async () => {
      await redisService.store?.quit?.();
      console.log('[Server] Shutdown complete.');
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('uncaughtException', (err) => { console.error('[Server] Uncaught Exception:', err); shutdown('uncaughtException'); });
  process.on('unhandledRejection', (reason) => { console.error('[Server] Unhandled Rejection:', reason); });
}

bootstrap().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});