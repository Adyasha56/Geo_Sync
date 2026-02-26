import { registerRoomHandlers } from './roomHandler.js';
import { registerMapHandlers } from './mapHandler.js';

export function initializeSocket(io) {
  // Connection-level middleware: log and validate
  io.use((socket, next) => {
    const { origin } = socket.handshake.headers;
    console.log(`[Socket] New connection attempt from origin: ${origin || 'unknown'}`);
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Register domain-specific handlers
    // Each handler file manages its own events — no god file
    registerRoomHandlers(io, socket);
    registerMapHandlers(io, socket);

    // Generic error handler per socket
    socket.on('error', (err) => {
      console.error(`[Socket] Error on ${socket.id}:`, err);
    });
  });

  // Server-level stats logging (every 60s in dev)
  if (process.env.NODE_ENV !== 'production') {
    setInterval(() => {
      const rooms = io.sockets.adapter.rooms;
      const clientCount = io.sockets.sockets.size;
      console.log(`[Socket] Active connections: ${clientCount}`);
    }, 60_000);
  }
}