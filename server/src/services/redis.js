import Redis from 'ioredis';

const SESSION_TTL = parseInt(process.env.SESSION_TTL || '3600');

// In-memory fallback store when Redis is unavailable
class InMemoryStore {
  constructor() {
    this.store = new Map();
    this.timers = new Map();
    console.warn('[Store] Redis unavailable — using in-memory fallback. Not suitable for multi-instance deployments.');
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

  async get(key) {
    return this.store.get(key) ?? null;
  }

  async del(key) {
    this.timers.delete(key);
    return this.store.delete(key) ? 1 : 0;
  }

  async exists(key) {
    return this.store.has(key) ? 1 : 0;
  }

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
      // ioredis connects automatically on instantiation — no .connect() call needed
      this.client = new Redis({
        host: process.env.REDIS_HOST || '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        connectTimeout: 3000,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null, // Don't keep retrying on startup failure
        lazyConnect: false,
      });

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

  // ─── Internal SET helper — always uses EX flag for TTL ───────────────────
  async _set(key, value) {
    if (this.isRedisConnected) {
      // ioredis syntax: set(key, value, 'EX', seconds)
      await this.client.set(key, value, 'EX', SESSION_TTL);
    } else {
      await this.store.set(key, value, 'EX', SESSION_TTL);
    }
  }

  // ─── Session Operations ───────────────────────────────────────────────────

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
    const key = `session:${sessionId}`;
    await this._set(key, JSON.stringify(updated));
    return updated;
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    return this.store.del(key);
  }

  async sessionExists(sessionId) {
    const key = `session:${sessionId}`;
    const result = await this.store.exists(key);
    return result === 1;
  }

  async refreshSessionTTL(sessionId) {
    await this.store.expire(`session:${sessionId}`, SESSION_TTL);
  }
}

// Singleton export
const redisService = new RedisService();
export default redisService;