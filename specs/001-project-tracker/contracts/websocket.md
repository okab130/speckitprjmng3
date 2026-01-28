# WebSocket Events Specification

**Project**: Project & Task Management System  
**Version**: 1.0.0  
**Date**: 2025-01-26

---

## Overview

This document specifies the WebSocket event protocol for real-time synchronization between clients and server. The system uses **Socket.IO** for WebSocket communication with automatic fallback to polling.

### Connection Details

- **URL**: `ws://localhost:3000` (development) / `wss://api.projecttracker.example.com` (production)
- **Protocol**: Socket.IO v4+
- **Authentication**: JWT token passed in handshake (`auth.token`)
- **Rooms**: Clients automatically join `project:default` room for broadcast events

---

## Authentication

### Handshake Authentication

```javascript
// Client connects with JWT token
const socket = io('http://localhost:3000', {
  auth: {
    token: '<JWT_ACCESS_TOKEN>'
  }
});
```

**Server Response**:
- **Success**: Connection established, client joined rooms
- **Failure**: Connection rejected with error event

### Error Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connect_error` | `{ message: 'AUTHENTICATION_REQUIRED' \| 'INVALID_TOKEN' }` | Authentication failed |

---

## Event Naming Convention

**Format**: `entity:action` (kebab-case)

**Examples**:
- `task:created` - New task created
- `task:updated` - Task properties changed
- `task:status_changed` - Task status updated
- `issue:created` - New issue logged
- `dependency:created` - Task dependency created

---

## Client-to-Server Events

### 1. sync:request

**Purpose**: Request state synchronization after reconnection

**Payload**:
```typescript
{
  lastSyncTimestamp: number  // Unix timestamp (ms) of last successful sync
}
```

**Example**:
```javascript
socket.emit('sync:request', { lastSyncTimestamp: 1706270400000 });
```

**Server Response**: `sync:response` event with delta updates

---

## Server-to-Client Events

### Task Events

#### task:created

**Purpose**: Broadcast when new task is created

**Payload**:
```typescript
{
  id: string;              // UUID
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Complete';
  creatorId: string;       // UUID
  startDate?: string;      // ISO 8601 date
  endDate?: string;        // ISO 8601 date
  version: number;
  createdAt: string;       // ISO 8601 timestamp
  updatedAt: string;       // ISO 8601 timestamp
  creator: {
    id: string;
    name: string;
    email: string;
  };
}
```

**Example**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Implement WebSocket server",
  "description": "Setup Socket.IO with Express",
  "status": "To Do",
  "creatorId": "user-123",
  "startDate": "2025-01-27",
  "endDate": "2025-01-30",
  "version": 1,
  "createdAt": "2025-01-26T10:30:00Z",
  "updatedAt": "2025-01-26T10:30:00Z",
  "creator": {
    "id": "user-123",
    "name": "Alice",
    "email": "alice@example.com"
  }
}
```

**Client Action**: Add task to local state (Zustand/Redux)

---

#### task:updated

**Purpose**: Broadcast when task properties are updated (title, description, dates)

**Payload**: Same as `task:created` with updated fields + incremented `version`

**Example**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Implement WebSocket server (updated)",
  "description": "Setup Socket.IO with Express and authentication",
  "status": "In Progress",
  "version": 2,
  "updatedAt": "2025-01-26T11:00:00Z"
}
```

**Client Action**: Update task in local state if version > current version

---

#### task:status_changed

**Purpose**: Broadcast when task status changes (optimized event for Kanban board)

**Payload**:
```typescript
{
  id: string;
  status: 'To Do' | 'In Progress' | 'Complete';
  version: number;
  updatedAt: string;
}
```

**Example**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "Complete",
  "version": 3,
  "updatedAt": "2025-01-26T12:00:00Z"
}
```

**Client Action**: Move task to new Kanban column, update local state

---

#### task:deleted

**Purpose**: Broadcast when task is permanently deleted

**Payload**:
```typescript
{
  id: string;  // UUID of deleted task
}
```

**Example**:
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

**Client Action**: Remove task from local state and UI

---

### Issue Events

#### issue:created

**Purpose**: Broadcast when new issue is logged

**Payload**:
```typescript
{
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'Resolved';
  severity: 'Low' | 'Medium' | 'High';
  creatorId: string;
  createdAt: string;
  resolvedAt?: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
}
```

**Example**:
```json
{
  "id": "issue-001",
  "title": "Database connection timeout",
  "description": "PostgreSQL pool exhausted under load",
  "status": "Open",
  "severity": "High",
  "creatorId": "user-456",
  "createdAt": "2025-01-26T13:00:00Z",
  "creator": {
    "id": "user-456",
    "name": "Bob",
    "email": "bob@example.com"
  }
}
```

**Client Action**: Add issue to local state

---

#### issue:updated

**Purpose**: Broadcast when issue properties are updated

**Payload**: Same as `issue:created` with updated fields

**Client Action**: Update issue in local state

---

#### issue:status_changed

**Purpose**: Broadcast when issue status changes (Open → Resolved)

**Payload**:
```typescript
{
  id: string;
  status: 'Open' | 'Resolved';
  resolvedAt?: string;  // Present when status = Resolved
}
```

**Example**:
```json
{
  "id": "issue-001",
  "status": "Resolved",
  "resolvedAt": "2025-01-26T14:00:00Z"
}
```

**Client Action**: Update issue status and resolved timestamp

---

#### issue:deleted

**Purpose**: Broadcast when issue is deleted

**Payload**:
```typescript
{
  id: string;
}
```

**Client Action**: Remove issue from local state

---

### Dependency Events

#### dependency:created

**Purpose**: Broadcast when task dependency is created (Gantt chart drag-and-connect)

**Payload**:
```typescript
{
  id: string;              // Dependency ID
  fromTaskId: string;      // Predecessor task
  toTaskId: string;        // Successor task
  createdAt: string;
}
```

**Example**:
```json
{
  "id": "dep-001",
  "fromTaskId": "task-123",
  "toTaskId": "task-456",
  "createdAt": "2025-01-26T15:00:00Z"
}
```

**Client Action**: Draw dependency line on Gantt chart

---

#### dependency:deleted

**Purpose**: Broadcast when task dependency is removed

**Payload**:
```typescript
{
  id: string;              // Dependency ID
  fromTaskId: string;
  toTaskId: string;
}
```

**Example**:
```json
{
  "id": "dep-001",
  "fromTaskId": "task-123",
  "toTaskId": "task-456"
}
```

**Client Action**: Remove dependency line from Gantt chart

---

### Link Events

#### task:issue_linked

**Purpose**: Broadcast when issue is linked to task

**Payload**:
```typescript
{
  taskId: string;
  issueId: string;
  issue: {
    id: string;
    title: string;
    status: string;
    severity: string;
  };
}
```

**Example**:
```json
{
  "taskId": "task-123",
  "issueId": "issue-001",
  "issue": {
    "id": "issue-001",
    "title": "Database connection timeout",
    "status": "Open",
    "severity": "High"
  }
}
```

**Client Action**: Update task detail view with linked issue

---

#### task:issue_unlinked

**Purpose**: Broadcast when issue is unlinked from task

**Payload**:
```typescript
{
  taskId: string;
  issueId: string;
}
```

**Client Action**: Remove issue from task detail view

---

### Synchronization Events

#### sync:response

**Purpose**: Server response to `sync:request` with delta updates

**Payload**:
```typescript
{
  tasks: Task[];           // Tasks modified since lastSyncTimestamp
  issues: Issue[];         // Issues modified since lastSyncTimestamp
  dependencies: TaskDependency[];
  syncedAt: number;        // New sync timestamp (Unix ms)
}
```

**Example**:
```json
{
  "tasks": [
    { "id": "task-123", "title": "Updated task", "version": 5 }
  ],
  "issues": [],
  "dependencies": [
    { "id": "dep-001", "fromTaskId": "task-123", "toTaskId": "task-456" }
  ],
  "syncedAt": 1706274000000
}
```

**Client Action**: Merge updates with local state, update `lastSyncTimestamp`

---

#### sync:error

**Purpose**: Synchronization failed

**Payload**:
```typescript
{
  message: string;
  code?: string;
}
```

**Client Action**: Log error, retry sync after delay

---

### User Presence (Future Enhancement - Out of Scope for Pilot)

#### user:online

**Purpose**: User connected to WebSocket

**Payload**:
```typescript
{
  userId: string;
  name: string;
}
```

#### user:offline

**Purpose**: User disconnected from WebSocket

**Payload**:
```typescript
{
  userId: string;
}
```

---

## Room-Based Broadcasting

### Room Structure

| Room | Purpose | Members |
|------|---------|---------|
| `project:default` | All users in the project | All authenticated clients |
| `user:<userId>` | Personal notifications | Specific user's connections |

### Broadcasting Strategy

**Scenario 1: User creates task**
- Server saves task to database
- Server broadcasts `task:created` to `project:default` room **EXCEPT** creator (already has optimistic update)
- All other clients receive update and refresh UI

**Scenario 2: User updates task status**
- Client sends PATCH request to `/tasks/:id`
- Server validates version, updates database
- Server broadcasts `task:status_changed` to `project:default` **EXCEPT** updater
- Kanban board updates for all other users

**Scenario 3: User reconnects after disconnect**
- Client emits `sync:request` with last known timestamp
- Server queries database for changes since timestamp
- Server sends `sync:response` to **only that client** (via socket.to(socketId))
- Client merges updates and resumes normal operation

---

## Client-Side Implementation Patterns

### React Hook for WebSocket Events

```typescript
// hooks/useWebSocket.ts
import { useEffect } from 'react';
import { getSocket } from '../lib/websocket';

export function useWebSocket(eventName: string, handler: (data: any) => void) {
  useEffect(() => {
    const socket = getSocket();
    socket.on(eventName, handler);
    
    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName, handler]);
}
```

### Usage in Component

```typescript
// components/KanbanBoard.tsx
import { useWebSocket } from '../hooks/useWebSocket';
import { useTaskStore } from '../store/taskStore';

function KanbanBoard() {
  const { addTask, updateTask, deleteTask } = useTaskStore();

  useWebSocket('task:created', (data) => {
    addTask(data);
  });

  useWebSocket('task:status_changed', (data) => {
    updateTask(data.id, { status: data.status, version: data.version });
  });

  useWebSocket('task:deleted', (data) => {
    deleteTask(data.id);
  });

  // ... render Kanban board
}
```

### Zustand State Store with Optimistic Updates

```typescript
// store/taskStore.ts
import { create } from 'zustand';

interface TaskState {
  tasks: Task[];
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],

  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, task]
  })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(t => 
      t.id === id && (!updates.version || updates.version > t.version)
        ? { ...t, ...updates }
        : t
    )
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(t => t.id !== id)
  })),
}));
```

---

## Error Handling

### Connection Errors

| Event | Trigger | Client Action |
|-------|---------|---------------|
| `connect_error` | Invalid JWT token | Redirect to login |
| `disconnect` | Network failure | Show offline banner, attempt reconnect |
| `reconnect` | Connection restored | Emit `sync:request` |

### Example Error Handler

```typescript
socket.on('connect_error', (error) => {
  if (error.message === 'INVALID_TOKEN') {
    // Token expired or invalid
    logout();
    navigate('/login');
  }
});

socket.on('disconnect', (reason) => {
  if (reason === 'io server disconnect') {
    // Server kicked client, don't reconnect automatically
    console.error('Disconnected by server');
  }
  // Socket.IO auto-reconnects for other reasons
});

socket.on('reconnect', () => {
  // Sync state after reconnection
  socket.emit('sync:request', { lastSyncTimestamp: getLastSyncTime() });
});
```

---

## Performance Considerations

### Throttling & Debouncing

**Problem**: Rapid task updates flood WebSocket with events

**Solution**: Server-side debouncing for status changes

```typescript
// Server-side debounce (200ms)
const debouncedBroadcast = debounce((event, data) => {
  io.to('project:default').emit(event, data);
}, 200);
```

### Message Batching (Future Enhancement)

For high-frequency updates (e.g., 10+ tasks moved simultaneously on Kanban):
- Batch multiple `task:status_changed` events into single `tasks:batch_updated` event
- Reduces network overhead and UI re-renders

---

## Testing WebSocket Events

### Manual Testing with Socket.IO Client

```bash
npm install -g socket.io-client

# Connect and listen
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3000', {
  auth: { token: '<YOUR_JWT_TOKEN>' }
});

socket.on('connect', () => console.log('Connected'));
socket.on('task:created', (data) => console.log('Task created:', data));
socket.on('task:updated', (data) => console.log('Task updated:', data));
"
```

### Automated Testing

```typescript
// tests/websocket.test.ts
import { io, Socket } from 'socket.io-client';

describe('WebSocket Events', () => {
  let socket: Socket;

  beforeAll((done) => {
    socket = io('http://localhost:3000', {
      auth: { token: 'valid-jwt-token' }
    });
    socket.on('connect', done);
  });

  afterAll(() => {
    socket.disconnect();
  });

  it('should receive task:created event when task is created', (done) => {
    socket.on('task:created', (data) => {
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('title');
      done();
    });

    // Trigger task creation via API
    createTask({ title: 'Test Task', status: 'To Do' });
  });
});
```

---

## Security Considerations

1. **Authentication**: JWT token validated on handshake; invalid tokens rejected
2. **Authorization**: Users see only events for projects they have access to (via room membership)
3. **Rate Limiting**: Socket.IO connections limited per IP (prevent DDoS)
4. **Event Validation**: Server validates all event payloads before broadcasting
5. **XSS Prevention**: Client sanitizes HTML in task titles/descriptions before rendering

---

## Future Enhancements (Out of Scope for Pilot)

- **User Presence**: `user:online`, `user:offline` events
- **Typing Indicators**: `task:editing` when user opens task form
- **Optimistic Conflict Resolution**: Show merge UI when `task:updated` conflicts with local edits
- **Message Batching**: Batch rapid status changes into single event
- **Selective Event Subscription**: Clients subscribe only to relevant events (reduces bandwidth)

---

**Next**: Create `quickstart.md` for developer onboarding
