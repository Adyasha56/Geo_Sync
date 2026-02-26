# GeoSync — Backend

Real-time map synchronization server built with Node.js, Express, Socket.io, and Redis.

---

## Quick Start

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Server runs on `http://localhost:3001`

---

## Redis Setup (Optional but Recommended)

**Without Redis:** Server auto-falls back to in-memory store. Works for single-instance dev.

**With Redis (Docker):**
```bash
docker run -d -p 6379:6379 --name geosync-redis redis:alpine
```

**With Redis (local install):**
```bash
brew install redis && brew services start redis   # macOS
sudo apt install redis-server && sudo systemctl start redis  # Ubuntu
```

---

## Project Structure

```
server/
├── src/
│   ├── index.js              # Entry point — bootstrap, graceful shutdown
│   ├── config/
│   │   └── app.js            # Express setup, CORS, REST routes
│   ├── socket/
│   │   ├── index.js          # Socket.io init, connects all handlers
│   │   ├── roomHandler.js    # Session create/join/leave, disconnect cleanup
│   │   └── mapHandler.js     # Map state sync, throttle, validation
│   └── services/
│       └── redis.js          # Redis client + in-memory fallback
├── .env.example
└── package.json
```

---

## REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server + Redis status |
| GET | `/api/session/:id` | Check if session exists, role availability |

---

## Socket Events Reference

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `session:create` | — | Create a new session, returns `sessionId` |
| `session:join` | `{ sessionId, preferredRole? }` | Join session, get assigned a role |
| `session:leave` | — | Leave current session |
| `map:update` | `{ lat, lng, zoom, bearing, pitch }` | Tracker broadcasts map state |
| `map:request_sync` | — | Tracked requests last known state |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `session:peer_joined` | `{ role, userId }` | Your peer has joined |
| `session:peer_disconnected` | `{ role, lastMapState, message }` | Your peer disconnected |
| `map:sync` | `{ lat, lng, zoom, bearing, pitch, timestamp }` | New map state to apply |

---

## Key Design Decisions

### Throttling (Server-side)
- Map updates are throttled at **33ms (~30fps)** server-side
- Client should also throttle at the same rate before emitting
- This prevents flooding the socket during smooth pans

### Redis Session Schema
```json
{
  "id": "ABC12345",
  "tracker": { "socketId": "...", "userId": "..." },
  "tracked": { "socketId": "...", "userId": "..." },
  "lastMapState": { "lat": 28.6139, "lng": 77.2090, "zoom": 14.5, "bearing": 0, "pitch": 0 },
  "createdAt": 1720000000000,
  "updatedAt": 1720000001234
}
```

### Tracker Disconnect Edge Case
When the Tracker disconnects:
1. Their slot is cleared in Redis
2. `session:peer_disconnected` is emitted to Tracked user with `lastMapState`
3. Tracked user's map freezes at last known position
4. Session stays alive — Tracker can rejoin with the same ID

### Scalability Path
To scale horizontally (multiple server instances):
```bash
npm install @socket.io/redis-adapter
```
Then in `socket/index.js`, attach the Redis adapter:
```js
import { createAdapter } from '@socket.io/redis-adapter';
io.adapter(createAdapter(pubClient, subClient));
```
This routes socket events across instances via Redis pub/sub.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Server port |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS origin |
| `REDIS_HOST` | `127.0.0.1` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | — | Redis password (if any) |
| `REDIS_URL` | — | Full Redis URL (overrides host/port) |
| `SESSION_TTL` | `3600` | Session expiry in seconds |