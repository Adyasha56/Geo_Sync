import { v4 as uuidv4 } from 'uuid';
import redisService from '../services/redis.js';

// Active socket-to-session mappings (server memory — fine for single instance)
// For multi-instance: move this to Redis too
export const socketSessionMap = new Map(); // socketId -> { sessionId, role }

/**
 * Session schema stored in Redis:
 * {
 *   id: string,
 *   tracker: { socketId: string, userId: string } | null,
 *   tracked: { socketId: string, userId: string } | null,
 *   lastMapState: { lat, lng, zoom, bearing, pitch } | null,
 *   createdAt: number,
 *   updatedAt: number
 * }
 */

export function registerRoomHandlers(io, socket) {
  //Create Session 
  socket.on('session:create', async (callback) => {
    try {
      const sessionId = uuidv4().slice(0, 8).toUpperCase(); // Short, readable ID
      const session = await redisService.createSession(sessionId, {
        id: sessionId,
        tracker: null,
        tracked: null,
        lastMapState: null,
      });

      console.log(`[Room] Session created: ${sessionId}`);
      callback({ success: true, sessionId });
    } catch (err) {
      console.error('[Room] session:create error:', err);
      callback({ success: false, error: 'Failed to create session' });
    }
  });

  // Join Session 
  socket.on('session:join', async ({ sessionId, preferredRole }, callback) => {
    try {
      if (!sessionId) {
        return callback({ success: false, error: 'Session ID is required' });
      }

      const session = await redisService.getSession(sessionId);

      if (!session) {
        return callback({ success: false, error: 'Session not found. Check the ID and try again.' });
      }

      // Determine role assignment
      let assignedRole = null;
      const userId = uuidv4();

      if (!session.tracker && (preferredRole === 'tracker' || !preferredRole)) {
        assignedRole = 'tracker';
      } else if (!session.tracked && (preferredRole === 'tracked' || !session.tracker)) {
        assignedRole = 'tracked';
      } else if (!session.tracker) {
        assignedRole = 'tracker';
      } else if (!session.tracked) {
        assignedRole = 'tracked';
      } else {
        return callback({ success: false, error: 'Session is full. Both roles are occupied.' });
      }

      // Register in session
      const userPayload = { socketId: socket.id, userId };
      const updates = { [assignedRole]: userPayload };
      const updatedSession = await redisService.updateSession(sessionId, updates);

      // Track socket → session mapping for cleanup on disconnect
      socketSessionMap.set(socket.id, { sessionId, role: assignedRole, userId });

      // Join the socket.io room
      socket.join(sessionId);

      // Notify the other user in the room that someone joined
      socket.to(sessionId).emit('session:peer_joined', {
        role: assignedRole,
        userId,
      });

      console.log(`[Room] ${assignedRole} joined session ${sessionId} (socket: ${socket.id})`);

      callback({
        success: true,
        role: assignedRole,
        userId,
        sessionId,
        // Send last known map state so late-joiners sync immediately
        lastMapState: updatedSession.lastMapState,
        // Tell them if their peer is already here
        peerConnected: assignedRole === 'tracker' ? !!updatedSession.tracked : !!updatedSession.tracker,
      });
    } catch (err) {
      console.error('[Room] session:join error:', err);
      callback({ success: false, error: 'Failed to join session' });
    }
  });

  // Leave Session 
  socket.on('session:leave', async (callback) => {
    await handleDisconnect(io, socket);
    if (typeof callback === 'function') callback({ success: true });
  });

  //  Disconnect 
  socket.on('disconnect', async (reason) => {
    console.log(`[Room] Socket disconnected: ${socket.id} — reason: ${reason}`);
    await handleDisconnect(io, socket);
  });
}

//  Shared disconnect logic 
async function handleDisconnect(io, socket) {
  const mapping = socketSessionMap.get(socket.id);
  if (!mapping) return;

  const { sessionId, role } = mapping;
  socketSessionMap.delete(socket.id);

  try {
    const session = await redisService.getSession(sessionId);
    if (!session) return;

    // Clear the role slot in the session
    const updates = { [role]: null };
    const updatedSession = await redisService.updateSession(sessionId, updates);

    // Notify the remaining peer
    socket.to(sessionId).emit('session:peer_disconnected', {
      role,
      lastMapState: session.lastMapState,
      message:
        role === 'tracker'
          ? 'Tracker disconnected. Map is frozen at last known position.'
          : 'Tracked user disconnected.',
    });

    console.log(`[Room] ${role} left session ${sessionId}`);

    // If both users gone, clean up the session
    if (!updatedSession.tracker && !updatedSession.tracked) {
      await redisService.deleteSession(sessionId);
      console.log(`[Room] Session ${sessionId} cleaned up (empty)`);
    }
  } catch (err) {
    console.error('[Room] handleDisconnect error:', err);
  }
}