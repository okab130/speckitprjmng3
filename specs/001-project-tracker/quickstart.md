# Quick Start Guide: Project & Task Management System

**Branch**: `001-project-tracker` | **Date**: 2025-01-26  
**Estimated Setup Time**: 30 minutes

---

## Prerequisites

Ensure you have the following installed:

| Tool | Version | Check Command |
|------|---------|---------------|
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **PostgreSQL** | 15+ | `psql --version` |
| **Docker** | 20+ | `docker --version` |
| **Git** | 2.30+ | `git --version` |

---

## Architecture Overview

```
┌─────────────────┐      HTTP/WS       ┌─────────────────┐      SQL       ┌─────────────────┐
│  React Frontend │ ◄──────────────────► │ Express Backend │ ◄──────────────► │ PostgreSQL DB  │
│  (Vite + Ant)   │  REST + Socket.IO  │  (Node.js TS)   │   pg driver    │  (Docker)       │
└─────────────────┘                     └─────────────────┘                └─────────────────┘
      Port 5173                               Port 3000                         Port 5432
```

---

## Quick Setup (5 Minutes)

### 1. Clone Repository

```bash
git clone <repository-url>
cd speckitprjmng3
git checkout 001-project-tracker
```

### 2. Start PostgreSQL Database

```bash
# Docker container is already configured
docker-compose up -d db

# Verify connection
psql postgresql://postgres:pass@localhost:5432/postgres -c "SELECT 1;"
```

### 3. Create Database Schema

```bash
# Run schema creation script
psql postgresql://postgres:pass@localhost:5432/postgres < specs/001-project-tracker/schema.sql

# Verify tables created
psql postgresql://postgres:pass@localhost:5432/postgres -c "\dt prjmng3.*"
```

Expected output:
```
              List of relations
 Schema  |       Name        | Type  |  Owner   
---------+-------------------+-------+----------
 prjmng3 | issues            | table | postgres
 prjmng3 | task_dependencies | table | postgres
 prjmng3 | task_issues       | table | postgres
 prjmng3 | tasks             | table | postgres
 prjmng3 | users             | table | postgres
```

### 4. Install Backend Dependencies

```bash
cd backend
npm install
```

### 5. Configure Environment Variables

```bash
# Create .env file in backend/
cat > .env << EOF
# Database
DATABASE_URL=postgresql://postgres:pass@localhost:5432/postgres?currentSchema=prjmng3

# JWT Secrets (generate with: openssl rand -base64 32)
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Server
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF
```

### 6. Start Backend Server

```bash
npm run dev

# Expected output:
# ✓ Database connected
# ✓ WebSocket server initialized
# ✓ Server listening on http://localhost:3000
```

### 7. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 8. Configure Frontend Environment

```bash
# Create .env file in frontend/
cat > .env << EOF
VITE_API_URL=http://localhost:3000
EOF
```

### 9. Start Frontend Development Server

```bash
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
```

### 10. Open Browser

Navigate to: **http://localhost:5173**

---

## Detailed Setup

### Backend Setup

#### Directory Structure

```
backend/
├── src/
│   ├── models/              # Database models
│   ├── services/            # Business logic
│   ├── api/                 # REST routes
│   ├── websocket/           # Socket.IO handlers
│   ├── middleware/          # Auth, validation
│   └── db/                  # Database connection
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
├── package.json
├── tsconfig.json
└── .env
```

#### Install Dependencies

```bash
cd backend
npm install express@4.18.2 \
  socket.io@4.6.1 \
  pg@8.11.3 \
  bcrypt@5.1.1 \
  jsonwebtoken@9.0.2 \
  dotenv@16.3.1 \
  cors@2.8.5 \
  helmet@7.1.0 \
  morgan@1.10.0

npm install -D typescript@5.3.3 \
  @types/node@20.10.6 \
  @types/express@4.17.21 \
  @types/bcrypt@5.0.2 \
  @types/jsonwebtoken@9.0.5 \
  @types/pg@8.10.9 \
  ts-node@10.9.2 \
  nodemon@3.0.2 \
  jest@29.7.0 \
  @types/jest@29.5.11 \
  supertest@6.3.3
```

#### Database Connection Setup

```typescript
// backend/src/db/pool.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  min: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✓ Database connected');
  } catch (err) {
    console.error('✗ Database connection failed:', err);
    process.exit(1);
  }
}
```

#### Express Server Setup

```typescript
// backend/src/index.ts
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { initializeWebSocket } from './websocket/server';
import { testConnection } from './db/pool';
import authRoutes from './api/auth';
import taskRoutes from './api/tasks';
import issueRoutes from './api/issues';
import dependencyRoutes from './api/dependencies';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/dependencies', dependencyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize WebSocket
const io = initializeWebSocket(httpServer);
app.set('io', io);

// Start server
const PORT = process.env.PORT || 3000;

async function start() {
  await testConnection();
  httpServer.listen(PORT, () => {
    console.log(`✓ Server listening on http://localhost:${PORT}`);
  });
}

start();
```

#### Run Backend

```bash
npm run dev
```

---

### Frontend Setup

#### Directory Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── features/            # Feature modules
│   ├── layouts/             # Page layouts
│   ├── lib/                 # API client, WebSocket
│   ├── hooks/               # Custom React hooks
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

#### Install Dependencies

```bash
cd frontend
npm install react@18.2.0 \
  react-dom@18.2.0 \
  react-router-dom@6.20.0 \
  antd@5.12.0 \
  @ant-design/icons@5.2.6 \
  zustand@4.4.7 \
  axios@1.6.2 \
  swr@2.2.4 \
  socket.io-client@4.6.1 \
  gantt-task-react@0.3.9 \
  @hello-pangea/dnd@16.5.0 \
  date-fns@3.0.0 \
  react-markdown@9.0.1

npm install -D typescript@5.3.3 \
  @types/react@18.2.45 \
  @types/react-dom@18.2.18 \
  vite@5.0.8 \
  @vitejs/plugin-react@4.2.1 \
  vitest@1.1.0 \
  @testing-library/react@14.1.2 \
  @testing-library/jest-dom@6.1.5
```

#### Vite Configuration

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

#### API Client Setup

```typescript
// frontend/src/lib/api.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // For httpOnly cookies
});

// Request interceptor: Add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Auto-refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        const { data } = await axios.post('/api/auth/refresh', {}, {
          withCredentials: true,
        });
        localStorage.setItem('accessToken', data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

#### WebSocket Client Setup

```typescript
// frontend/src/lib/websocket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initializeSocket(token: string): Socket {
  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => console.log('✓ WebSocket connected'));
  socket.on('disconnect', () => console.log('✗ WebSocket disconnected'));

  return socket;
}

export function getSocket(): Socket {
  if (!socket) throw new Error('Socket not initialized');
  return socket;
}
```

#### Run Frontend

```bash
npm run dev
```

Open browser: **http://localhost:5173**

---

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# Integration tests
npm run test:integration

# Contract tests (API endpoints)
npm run test:contract

# Coverage report
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend

# Component unit tests
npm run test

# UI integration tests
npm run test:ui

# Run tests in watch mode
npm run test:watch
```

---

## Database Management

### Run Migrations

```bash
# Apply schema changes
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

### Seed Development Data

```bash
# Insert test users and tasks
psql $DATABASE_URL -f seeds/dev_data.sql
```

### Reset Database

```bash
# Drop all tables and recreate
psql $DATABASE_URL << EOF
DROP SCHEMA IF EXISTS prjmng3 CASCADE;
CREATE SCHEMA prjmng3;
EOF

# Reapply schema
psql $DATABASE_URL < specs/001-project-tracker/schema.sql
```

### Database Utilities

```bash
# Connect to database
psql $DATABASE_URL

# List all tables
\dt prjmng3.*

# Describe table structure
\d prjmng3.tasks

# View table data
SELECT * FROM prjmng3.tasks LIMIT 10;
```

---

## Common Development Tasks

### Create New Task

```bash
# Via curl
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Implement search feature",
    "description": "Add full-text search with filters",
    "status": "To Do",
    "startDate": "2025-01-27",
    "endDate": "2025-01-30"
  }'
```

### Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "DevPass123",
    "name": "Developer"
  }'
```

### Test WebSocket Connection

```javascript
// Open browser console at http://localhost:5173
const socket = io('http://localhost:3000', {
  auth: { token: localStorage.getItem('accessToken') }
});

socket.on('connect', () => console.log('Connected'));
socket.on('task:created', (data) => console.log('New task:', data));
```

---

## Troubleshooting

### Database Connection Failed

**Symptom**: `ECONNREFUSED` error

**Solution**:
```bash
# Check if PostgreSQL container is running
docker ps | grep db

# Restart container
docker-compose restart db

# Check logs
docker logs db
```

### Backend Port Already in Use

**Symptom**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
PORT=3001
```

### Frontend Cannot Connect to Backend

**Symptom**: Network errors in browser console

**Solution**:
1. Verify backend is running: `curl http://localhost:3000/health`
2. Check CORS configuration in backend
3. Ensure `VITE_API_URL` in frontend `.env` is correct

### WebSocket Connection Fails

**Symptom**: `connect_error` events in browser console

**Solution**:
```bash
# Check JWT token is valid
# In browser console:
localStorage.getItem('accessToken')

# If invalid, re-login:
// Navigate to /login and sign in again
```

### Tests Failing

**Symptom**: Jest/Vitest errors

**Solution**:
```bash
# Clear Jest cache
npm run test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Development Workflow

### Daily Workflow

1. **Start Services**
   ```bash
   docker-compose up -d db      # Start database
   cd backend && npm run dev     # Start backend
   cd frontend && npm run dev    # Start frontend
   ```

2. **Make Changes**
   - Edit code in `src/` directories
   - Hot reload applies automatically

3. **Test Changes**
   ```bash
   npm run test                  # Run tests
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: implement feature"
   git push origin 001-project-tracker
   ```

### Debugging

#### Backend Debugging (VS Code)

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/backend/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

#### Frontend Debugging

- Open browser DevTools (F12)
- Sources → `src/` folder → Set breakpoints
- Or use React DevTools extension

---

## API Documentation

### Swagger UI

Access interactive API docs at: **http://localhost:3000/api-docs**

(Requires Swagger setup in backend)

### OpenAPI Specification

View full API spec: `specs/001-project-tracker/contracts/openapi.yaml`

### WebSocket Events

View event specifications: `specs/001-project-tracker/contracts/websocket.md`

---

## Next Steps

1. **Implement Authentication**: Start with `/auth/register` and `/auth/login` endpoints
2. **Build Task CRUD**: Implement task management API
3. **Setup WebSocket**: Initialize Socket.IO server and event handlers
4. **Create UI Components**: Build Kanban board and Gantt chart views
5. **Add Search**: Implement search and filtering functionality
6. **Write Tests**: Add unit, integration, and contract tests

---

## Resources

### Documentation
- **Feature Spec**: `specs/001-project-tracker/spec.md`
- **Implementation Plan**: `specs/001-project-tracker/plan.md`
- **Research Findings**: `specs/001-project-tracker/research.md`
- **Data Model**: `specs/001-project-tracker/data-model.md`

### External Resources
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [Ant Design Components](https://ant.design/components/overview/)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)

---

## Getting Help

- **Issues**: Open GitHub issue with `bug` or `question` label
- **Discussions**: Use GitHub Discussions for feature ideas
- **Slack**: `#project-tracker` channel (if available)

---

**Ready to build!** 🚀

Start with backend authentication endpoints, then move to task management, and finally integrate WebSocket for real-time updates.
