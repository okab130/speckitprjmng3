import { getWebSocketServer } from '../websocket/server';

export type WebSocketEventType =
  | 'task:created'
  | 'task:updated'
  | 'task:deleted'
  | 'issue:created'
  | 'issue:updated'
  | 'issue:deleted'
  | 'issue:linked'
  | 'issue:unlinked'
  | 'dependency:created'
  | 'dependency:deleted'
  | 'task_issue:linked'
  | 'task_issue:unlinked'
  | 'sync:required';

export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
  timestamp: Date;
}

class WebSocketService {
  /**
   * Broadcast event to all connected clients
   */
  broadcastToAll(event: WebSocketEventType, payload: any) {
    const io = getWebSocketServer();
    const eventData: WebSocketEvent = {
      type: event,
      payload,
      timestamp: new Date(),
    };

    console.log(`[WebSocket] Broadcasting to all clients:`, event, JSON.stringify(payload).substring(0, 100));
    io.to('all').emit(event, eventData);
    console.log(`[WebSocket] Event emitted successfully`);
  }

  /**
   * Send event to a specific user
   */
  sendToUser(userId: string, event: WebSocketEventType, payload: any) {
    const io = getWebSocketServer();
    const eventData: WebSocketEvent = {
      type: event,
      payload,
      timestamp: new Date(),
    };

    io.to(`user:${userId}`).emit(event, eventData);
    console.log(`Sent to user ${userId}: ${event}`, payload);
  }

  /**
   * Notify all clients except the sender
   */
  broadcastExcept(socketId: string, event: WebSocketEventType, payload: any) {
    const io = getWebSocketServer();
    const eventData: WebSocketEvent = {
      type: event,
      payload,
      timestamp: new Date(),
    };

    io.except(socketId).to('all').emit(event, eventData);
    console.log(`Broadcast except ${socketId}: ${event}`, payload);
  }
}

export default new WebSocketService();

/**
 * Helper function to broadcast task events
 */
export async function broadcastTaskEvent(event: WebSocketEventType, payload: any) {
  const wsService = new WebSocketService();
  wsService.broadcastToAll(event, payload);
}

/**
 * Helper function to broadcast issue events
 */
export async function broadcastIssueEvent(event: WebSocketEventType, payload: any) {
  const wsService = new WebSocketService();
  wsService.broadcastToAll(event, payload);
}

/**
 * Helper function to broadcast dependency events
 */
export async function broadcastDependencyEvent(event: WebSocketEventType, payload: any) {
  const wsService = new WebSocketService();
  wsService.broadcastToAll(event, payload);
}
