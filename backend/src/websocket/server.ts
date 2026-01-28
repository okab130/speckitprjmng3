import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server;

export function initializeWebSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return next(new Error('JWT_SECRET not configured'));
      }

      const decoded = jwt.verify(token, secret) as { id: string; email: string };
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id} (User: ${socket.data.user.email})`);

    // Join user to personal room for targeted broadcasts
    socket.join(`user:${socket.data.user.id}`);

    // Join all clients to a global room for app-wide broadcasts
    socket.join('all');
    
    console.log(`[WebSocket] Socket ${socket.id} joined rooms: all, user:${socket.data.user.id}`);

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
    });

    // Handle sync request (when client reconnects)
    socket.on('sync:request', () => {
      socket.emit('sync:required');
    });
  });

  console.log('✓ WebSocket server initialized');
  return io;
}

export function getWebSocketServer(): Server {
  if (!io) {
    throw new Error('WebSocket server not initialized');
  }
  return io;
}

export function getIO(): Server | null {
  return io || null;
}
