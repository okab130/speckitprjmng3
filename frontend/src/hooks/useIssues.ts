import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { getWebSocket } from '../lib/websocket';
import { useIssueStore } from '../store/issueStore';

/**
 * Custom hook for managing issues with WebSocket sync
 */
export const useIssues = () => {
  const issueStore = useIssueStore();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = getWebSocket();
    setSocket(ws);
  }, []);

  // Subscribe to WebSocket events
  useEffect(() => {
    if (!socket) return;

    // Issue created
    const handleIssueCreated = (event: any) => {
      issueStore.handleIssueCreated(event.payload);
    };

    // Issue updated
    const handleIssueUpdated = (event: any) => {
      issueStore.handleIssueUpdated(event.payload);
    };

    // Issue deleted
    const handleIssueDeleted = (event: any) => {
      issueStore.handleIssueDeleted(event.payload);
    };

    // Issue linked to task
    const handleIssueLinked = (event: any) => {
      issueStore.handleIssueLinked(event.payload);
    };

    // Issue unlinked from task
    const handleIssueUnlinked = (event: any) => {
      issueStore.handleIssueUnlinked(event.payload);
    };

    socket.on('issue:created', handleIssueCreated);
    socket.on('issue:updated', handleIssueUpdated);
    socket.on('issue:deleted', handleIssueDeleted);
    socket.on('issue:linked', handleIssueLinked);
    socket.on('issue:unlinked', handleIssueUnlinked);

    // Cleanup
    return () => {
      socket.off('issue:created', handleIssueCreated);
      socket.off('issue:updated', handleIssueUpdated);
      socket.off('issue:deleted', handleIssueDeleted);
      socket.off('issue:linked', handleIssueLinked);
      socket.off('issue:unlinked', handleIssueUnlinked);
    };
  }, [socket, issueStore]);

  return issueStore;
};
