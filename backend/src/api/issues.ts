import express, { Response, NextFunction } from 'express';
import { z } from 'zod';
import { IssueService } from '../services/issueService';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { validate } from '../middleware/validation';
import { broadcastIssueEvent } from '../services/websocketService';

const router = express.Router();

/**
 * Zod Validation Schemas
 */

// Create issue schema
const createIssueSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be at most 255 characters'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['To Do', 'In Progress', 'Complete']).default('To Do'),
  severity: z.enum(['Low', 'Medium', 'High']).default('Medium'),
  dueDate: z.string().datetime().optional(),
});

// Update issue schema
const updateIssueSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(['To Do', 'In Progress', 'Complete']).optional(),
  severity: z.enum(['Low', 'Medium', 'High']).optional(),
  dueDate: z.string().datetime().optional(),
});

// Query filters schema
const issueFiltersSchema = z.object({
  status: z.enum(['To Do', 'In Progress', 'Complete']).optional(),
  severity: z.enum(['Low', 'Medium', 'High']).optional(),
  creatorId: z.string().uuid().optional(),
});

/**
 * POST /api/issues
 * Create a new issue
 */
router.post(
  '/',
  authenticate,
  validate(createIssueSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { title, description, status, severity, dueDate } = req.body;
      const creatorId = req.user!.userId;

      const issue = await IssueService.createIssue(
        title,
        description,
        status || 'To Do',
        severity || 'Medium',
        creatorId,
        dueDate ? new Date(dueDate) : undefined
      );

      // Broadcast issue:created event
      broadcastIssueEvent('issue:created', issue);

      res.status(201).json(issue);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/issues
 * Get all issues with optional filters
 */
router.get(
  '/',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Validate query parameters
      const filters = issueFiltersSchema.parse(req.query);

      const issues = await IssueService.getIssues(filters);

      res.json(issues);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/issues/:id
 * Get a single issue by ID
 */
router.get(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const issue = await IssueService.getIssueById(id);

      if (!issue) {
        res.status(404).json({ error: 'Issue not found' });
        return;
      }

      res.json(issue);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/issues/:id
 * Update an issue
 */
router.patch(
  '/:id',
  authenticate,
  validate(updateIssueSchema),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const issue = await IssueService.updateIssue(id, updates);

      if (!issue) {
        res.status(404).json({ error: 'Issue not found' });
        return;
      }

      // Broadcast issue:updated event
      broadcastIssueEvent('issue:updated', issue);

      res.json(issue);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/issues/:id
 * Delete an issue
 */
router.delete(
  '/:id',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Get issue before deletion for broadcasting
      const issue = await IssueService.getIssueById(id);
      if (!issue) {
        res.status(404).json({ error: 'Issue not found' });
        return;
      }

      const deleted = await IssueService.deleteIssue(id);

      if (!deleted) {
        res.status(404).json({ error: 'Issue not found' });
        return;
      }

      // Broadcast issue:deleted event
      broadcastIssueEvent('issue:deleted', { id });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

export default router;
