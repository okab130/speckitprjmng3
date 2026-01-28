import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeWebSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io('http://localhost:3000', {
    auth: {
      token,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✓ [WebSocket] Connected. Socket ID:', socket?.id);
    console.log('✓ [WebSocket] Connected to rooms: all, user:*');
  });

  socket.on('disconnect', (reason) => {
    console.log('✗ [WebSocket] Disconnected. Reason:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('✗ [WebSocket] Connection error:', error.message);
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log('✓ WebSocket reconnected after', attemptNumber, 'attempts');
    // Request data sync after reconnection
    socket?.emit('sync:request');
  });

  return socket;
}

export function getWebSocket(): Socket | null {
  return socket;
}

export function getWebSocketClient(): Socket | null {
  return socket;
}

export function disconnectWebSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
