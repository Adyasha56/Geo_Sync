import Redis from 'ioredis';

const SESSION_TTL = parseInt(process.env.SESSION_TTL || '3600');

// In-memory fallback store when Redis is unavailable
class InMemoryStore {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
    console.warn('[Store] Redis unavailable — using in-memory fallback.');
  }

  // Matches ioredis signature: set(key, value, 'EX', ttl)
  async set(key, value, exFlag, ttl) {
    this.store.set(key, value);
    if (this.timers.has(key)) clearTimeout(this.timers.get(key));
    if (exFlag === 'EX' && ttl) {
      const timer = setTimeout(() => this.store.delete(key), ttl * 1000);
      this.timers.set(key, timer);
    }
    return 'OK';
  }

  async get(key) { return this.store.get(key) ?? null; }

  async del(key) {
    this.timers.delete(key);
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key) { return this.store.has(key) ? 1 : 0; }

  async expire(key, ttl) {
    if (!this.store.has(key)) return 0;
    if (this.timers.has(key)) clearTimeout(this.timers.get(key));
    const timer = setTimeout(() => this.store.delete(key), ttl * 1000);
    this.timers.set(key, timer);
    return 1;
  }

  async quit() {}
}

class RedisService {
  constructor() {
    this.client = null;
    this.store = null;
    this.isRedisConnected = false;
  }

  async connect() {
    try {
      // REDIS_URL supports:
      // - redis://...   standard (local/Railway)
      // - rediss://...  TLS (Upstash — ioredis auto-enables TLS for rediss://)
      const config = process.env.REDIS_URL
        ? {
            // URL string + options
            url: process.env.REDIS_URL,
            connectTimeout: 5000,
            maxRetriesPerRequest: 1,
            retryStrategy: () => null,
          }
        : {
            // Individual configs (local development)
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD || undefined,
            connectTimeout: 5000,
            maxRetriesPerRequest: 1,
            retryStrategy: () => null,
          };

      this.client = new Redis(config);

      // Test the connection
      await this.client.ping();

      this.isRedisConnected = true;
      this.store = this.client;
      console.log('[Redis] Connected successfully');
    } catch (err) {
      console.warn(`[Redis] Connection failed: ${err.message}`);
      if (this.client) {
        this.client.disconnect();
        this.client = null;
      }
      this.store = new InMemoryStore();
      this.isRedisConnected = false;
    }
  }

  async _set(key, value) {
    if (this.isRedisConnected) {
      await this.client.set(key, value, 'EX', SESSION_TTL);
    } else {
      await this.store.set(key, value, 'EX', SESSION_TTL);
    }
  }

  async createSession(sessionId, data) {
    const key = `session:${sessionId}`;
    const payload = JSON.stringify({ ...data, createdAt: Date.now() });
    await this._set(key, payload);
    return data;
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    const raw = await this.store.get(key);
    return raw ? JSON.parse(raw) : null;
  }

  async updateSession(sessionId, updates) {
    const existing = await this.getSession(sessionId);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updatedAt: Date.now() };
    await this._set(`session:${sessionId}`, JSON.stringify(updated));
    return updated;
  }

  async deleteSession(sessionId) {
    return this.store.del(`session:${sessionId}`);
  }

  async sessionExists(sessionId) {
    const result = await this.store.exists(`session:${sessionId}`);
    return result === 1;
  }

  async refreshSessionTTL(sessionId) {
    await this.store.expire(`session:${sessionId}`, SESSION_TTL);
  }
}

const redisService = new RedisService();
export default redisService;