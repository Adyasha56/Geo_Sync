import express from 'express';
import cors from 'cors';
import redisService from '../services/redis.js';

export function createApp() {
  const app = express();

  // ─── Middleware ────────────────────────────────────────────────────────────
  app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }));

  app.use(express.json());

  // ─── Routes ────────────────────────────────────────────────────────────────

  // Health check — useful for deployment monitoring
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      redis: redisService.isRedisConnected ? 'connected' : 'fallback (in-memory)',
      timestamp: new Date().toISOString(),
    });
  });

  // Session existence check (REST — so client can validate before socket join)
  app.get('/api/session/:id', async (req, res) => {
    try {
      const session = await redisService.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ exists: false, error: 'Session not found' });
      }

      // Return non-sensitive session info
      res.json({
        exists: true,
        id: session.id,
        hasTracker: !!session.tracker,
        hasTracked: !!session.tracked,
        isFull: !!session.tracker && !!session.tracked,
        lastMapState: session.lastMapState,
      });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // 404 fallback
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
}