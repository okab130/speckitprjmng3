import { Router, Response } from 'express';
import { z } from 'zod';
import { TaskService } from '../services/taskService';
import { IssueService } from '../services/issueService';
import { validate } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { broadcastTaskEvent, broadcastIssueEvent } from '../services/websocketService';

const router = Router();

// Apply authentication to all task routes
router.use(authenticate);

// Validation schemas
const taskStatusEnum = z.enum(['To Do', 'In Progress', 'Complete']);
const phaseEnum = z.enum(['要件定義', '設計', '製造', 'テスト', '本番移行']);

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  status: taskStatusEnum.optional(),
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  phase: phaseEnum.optional(),
  functionId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['startDate'],
  }
);

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().optional().nullable(),
  status: taskStatusEnum.optional(),
  startDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).nullable(),
  endDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()).nullable(),
  phase: phaseEnum.optional().nullable(),
  functionId: z.string().uuid().optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  projectId: z.string().uuid().optional().nullable(),
  version: z.number().int().positive('Version must be a positive integer'),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  },
  {
    message: 'Start date must be before or equal to end date',
    path: ['startDate'],
  }
);

const taskFiltersSchema = z.object({
  query: z.string().optional(),
  status: taskStatusEnum.optional(),
  creatorId: z.string().uuid().optional(),
  startDateFrom: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  endDateTo: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  phase: phaseEnum.optional(),
  functionId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  groupByStatus: z.enum(['true', 'false']).optional(), // For Kanban board view
});

/**
 * POST /api/tasks
 * Create a new task
 */
router.post('/', validate(createTaskSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const task = await TaskService.createTask(req.body, req.user.userId);
    
    // Broadcast task creation event
    await broadcastTaskEvent('task:created', task);
    
    res.status(201).json(task);
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(400).json({ error: error.message || 'Failed to create task' });
  }
});

/**
 * GET /api/tasks
 * Get all tasks with optional filters
 * Supports groupByStatus=true for Kanban board view
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    // Validate query parameters
    const filters = taskFiltersSchema.parse(req.query);
    
    // If groupByStatus is requested, return grouped data for Kanban
    if (filters.groupByStatus === 'true') {
      const groupedTasks = await TaskService.getTasksGroupedByStatus();
      res.status(200).json(groupedTasks);
      return;
    }

    // Convert string dates to Date objects
    const processedFilters = {
      ...filters,
      startDateFrom: filters.startDateFrom ? new Date(filters.startDateFrom) : undefined,
      endDateTo: filters.endDateTo ? new Date(filters.endDateTo) : undefined,
    };

    const tasks = await TaskService.getAllTasks(processedFilters);
    res.status(200).json(tasks);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
      return;
    }
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await TaskService.getTaskById(req.params.id);
    res.status(200).json(task);
  } catch (error: any) {
    if (error.message === 'Task not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

/**
 * PATCH /api/tasks/:id
 * Update a task with optimistic locking
 */
router.patch('/:id', validate(updateTaskSchema), async (req: AuthRequest, res: Response) => {
  try {
    const task = await TaskService.updateTask(req.params.id, req.body);
    
    // Broadcast task update event
    await broadcastTaskEvent('task:updated', task);
    
    res.status(200).json(task);
  } catch (error: any) {
    if (error.message === 'Task not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('modified by another user')) {
      res.status(409).json({ error: error.message });
      return;
    }
    console.error('Update task error:', error);
    res.status(400).json({ error: error.message || 'Failed to update task' });
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await TaskService.deleteTask(req.params.id);
    
    // Broadcast task deletion event
    await broadcastTaskEvent('task:deleted', { id: req.params.id });
    
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Task not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

/**
 * POST /api/tasks/:taskId/issues/:issueId
 * Link an issue to a task
 */
router.post('/:taskId/issues/:issueId', async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, issueId } = req.params;

    // Verify task exists
    const task = await TaskService.getTaskById(taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    // Link issue to task
    await IssueService.linkIssueToTask(taskId, issueId);

    // Broadcast issue:linked event
    broadcastIssueEvent('issue:linked', { taskId, issueId });

    res.status(201).json({ message: 'Issue linked to task successfully' });
  } catch (error: any) {
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Link issue to task error:', error);
    res.status(500).json({ error: 'Failed to link issue to task' });
  }
});

/**
 * DELETE /api/tasks/:taskId/issues/:issueId
 * Unlink an issue from a task
 */
router.delete('/:taskId/issues/:issueId', async (req: AuthRequest, res: Response) => {
  try {
    const { taskId, issueId } = req.params;

    const unlinked = await IssueService.unlinkIssueFromTask(taskId, issueId);

    if (!unlinked) {
      res.status(404).json({ error: 'Link not found' });
      return;
    }

    // Broadcast issue:unlinked event
    broadcastIssueEvent('issue:unlinked', { taskId, issueId });

    res.status(204).send();
  } catch (error: any) {
    console.error('Unlink issue from task error:', error);
    res.status(500).json({ error: 'Failed to unlink issue from task' });
  }
});

/**
 * GET /api/tasks/:taskId/issues
 * Get all issues linked to a task
 */
router.get('/:taskId/issues', async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;

    // Verify task exists
    const task = await TaskService.getTaskById(taskId);
    if (!task) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    const issues = await IssueService.getIssuesForTask(taskId);

    res.json(issues);
  } catch (error: any) {
    console.error('Get issues for task error:', error);
    res.status(500).json({ error: 'Failed to get issues for task' });
  }
});

export default router;
