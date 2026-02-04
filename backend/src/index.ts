import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initializeWebSocket } from './websocket/server';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
import authRoutes from './api/auth';
import taskRoutes from './api/tasks';
import issueRoutes from './api/issues';
import issueCommentRoutes from './api/issueComments';
import functionRoutes from './api/functions';
import userRoutes from './api/users';
import projectRoutes from './api/projects';

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/issues', issueCommentRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Initialize WebSocket server
initializeWebSocket(httpServer);

// Import database connection to test it on startup
import './db/connection';

// Start server
httpServer.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
