import redisService from '../services/redis.js';
import { socketSessionMap } from './roomHandler.js';

/**
 * Map state schema:
 * {
 *   lat: number,    // high-precision float
 *   lng: number,    // high-precision float
 *   zoom: number,   // float (e.g., 14.5)
 *   bearing: number, // 0-360 degrees (map rotation)
 *   pitch: number,  // 0-60 degrees (map tilt)
 *   timestamp: number
 * }
 */

// Per-socket throttle tracker (last emit time)
const lastEmitTime = new Map();
const THROTTLE_MS = 33; // ~30fps max — enough for smooth sync, won't flood the socket

export function registerMapHandlers(io, socket) {
  //  Tracker broadcasts map movement 
  socket.on('map:update', async (mapState, callback) => {
    try {
      const mapping = socketSessionMap.get(socket.id);

      if (!mapping) {
        return typeof callback === 'function' &&
          callback({ success: false, error: 'Not in a session' });
      }

      if (mapping.role !== 'tracker') {
        return typeof callback === 'function' &&
          callback({ success: false, error: 'Only the Tracker can broadcast map updates' });
      }

      // Server-side throttle guard (client should throttle too, double safety)
      const now = Date.now();
      const lastTime = lastEmitTime.get(socket.id) || 0;
      if (now - lastTime < THROTTLE_MS) {
        return typeof callback === 'function' && callback({ success: true, throttled: true });
      }
      lastEmitTime.set(socket.id, now);

      const { sessionId } = mapping;

      // Validate and sanitize the map state
      const sanitized = sanitizeMapState(mapState);
      if (!sanitized) {
        return typeof callback === 'function' &&
          callback({ success: false, error: 'Invalid map state payload' });
      }

      // Persist last known state in Redis (for late-joiner sync)
      await redisService.updateSession(sessionId, { lastMapState: sanitized });

      // Broadcast to ALL other sockets in the room (only the Tracked user)
      socket.to(sessionId).emit('map:sync', sanitized);

      typeof callback === 'function' && callback({ success: true });
    } catch (err) {
      console.error('[Map] map:update error:', err);
      typeof callback === 'function' && callback({ success: false, error: 'Server error' });
    }
  });

  //  Tracked user requests resync (Re-sync to Tracker button) 
  socket.on('map:request_sync', async (callback) => {
    try {
      const mapping = socketSessionMap.get(socket.id);

      if (!mapping) {
        return typeof callback === 'function' &&
          callback({ success: false, error: 'Not in a session' });
      }

      const { sessionId } = mapping;
      const session = await redisService.getSession(sessionId);

      if (!session) {
        return typeof callback === 'function' &&
          callback({ success: false, error: 'Session not found' });
      }

      if (!session.lastMapState) {
        return typeof callback === 'function' &&
          callback({ success: false, error: 'No map state available yet' });
      }

      // Send last known state only to the requester
      socket.emit('map:sync', session.lastMapState);
      typeof callback === 'function' && callback({ success: true, mapState: session.lastMapState });
    } catch (err) {
      console.error('[Map] map:request_sync error:', err);
      typeof callback === 'function' && callback({ success: false, error: 'Server error' });
    }
  });

  // ─── Cleanup on socket removal ────────────────────────────────────────────
  socket.on('disconnect', () => {
    lastEmitTime.delete(socket.id);
  });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeMapState(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const lat = parseFloat(raw.lat);
  const lng = parseFloat(raw.lng);
  const zoom = parseFloat(raw.zoom);
  const bearing = parseFloat(raw.bearing ?? 0);
  const pitch = parseFloat(raw.pitch ?? 0);

  // Basic validation
  if (isNaN(lat) || isNaN(lng) || isNaN(zoom)) return null;
  if (lat < -90 || lat > 90) return null;
  if (lng < -180 || lng > 180) return null;
  if (zoom < 0 || zoom > 24) return null;

  return {
    lat,   // Full IEEE 754 double precision
    lng,
    zoom,
    bearing: isNaN(bearing) ? 0 : Math.max(0, Math.min(360, bearing)),
    pitch: isNaN(pitch) ? 0 : Math.max(0, Math.min(85, pitch)),
    timestamp: Date.now(),
  };
}