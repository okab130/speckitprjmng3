import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getWebSocket } from '../lib/websocket';

export type WebSocketEventType =
  | 'task:created'
  | 'task:updated'
  | 'task:deleted'
  | 'issue:created'
  | 'issue:updated'
  | 'issue:deleted'
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

export function useWebSocket(
  eventType: WebSocketEventType,
  handler: (event: WebSocketEvent) => void
) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const ws = getWebSocket();
    setSocket(ws);

    if (ws) {
      ws.on(eventType, handler);

      return () => {
        ws.off(eventType, handler);
      };
    }
  }, [eventType, handler]);

  return socket;
}
