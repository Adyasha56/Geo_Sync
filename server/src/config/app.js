import express from 'express';
import cors from 'cors';
import redisService from '../services/redis.js';

export function createApp(allowedOrigins) {
  const app = express();

  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }));

  app.use(express.json());

  // Health check — Railway uses this to verify the service is up
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      redis: redisService.isRedisConnected ? 'connected' : 'fallback (in-memory)',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/session/:id', async (req, res) => {
    try {
      const session = await redisService.getSession(req.params.id);
      if (!session) return res.status(404).json({ exists: false, error: 'Session not found' });
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

  app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

  return app;
}