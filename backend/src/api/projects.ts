import { Router, Response } from 'express';
import { z } from 'zod';
import { ProjectService } from '../services/projectService';
import { validate } from '../middleware/validation';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

// Apply authentication to all project routes
router.use(authenticate);

// Validation schemas
const projectStatusEnum = z.enum(['Active', 'Archived', 'Completed']);

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  status: projectStatusEnum.optional(),
});

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long').optional(),
  description: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
  version: z.number().int().positive('Version must be a positive integer'),
});

const projectFiltersSchema = z.object({
  status: projectStatusEnum.optional(),
  createdBy: z.string().uuid().optional(),
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', validate(createProjectSchema), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const project = await ProjectService.createProject(req.body, req.user.userId);
    res.status(201).json(project);
  } catch (error: any) {
    console.error('Create project error:', error);
    res.status(400).json({ error: error.message || 'Failed to create project' });
  }
});

/**
 * GET /api/projects
 * Get all projects with optional filters
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const filters = projectFiltersSchema.parse(req.query);
    const projects = await ProjectService.getAllProjects(filters);
    res.status(200).json(projects);
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: 'Invalid query parameters', details: error.errors });
      return;
    }
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/projects/:id
 * Get a single project by ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await ProjectService.getProjectById(req.params.id);
    res.status(200).json(project);
  } catch (error: any) {
    if (error.message === 'Project not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * GET /api/projects/:id/statistics
 * Get project statistics
 */
router.get('/:id/statistics', async (req: AuthRequest, res: Response) => {
  try {
    const statistics = await ProjectService.getProjectStatistics(req.params.id);
    res.status(200).json(statistics);
  } catch (error: any) {
    if (error.message === 'Project not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Get project statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch project statistics' });
  }
});

/**
 * PATCH /api/projects/:id
 * Update a project with optimistic locking
 */
router.patch('/:id', validate(updateProjectSchema), async (req: AuthRequest, res: Response) => {
  try {
    const project = await ProjectService.updateProject(req.params.id, req.body);
    res.status(200).json(project);
  } catch (error: any) {
    if (error.message === 'Project not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message.includes('modified by another user')) {
      res.status(409).json({ error: error.message });
      return;
    }
    console.error('Update project error:', error);
    res.status(400).json({ error: error.message || 'Failed to update project' });
  }
});

/**
 * DELETE /api/projects/:id
 * Delete a project
 */
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    await ProjectService.deleteProject(req.params.id);
    res.status(204).send();
  } catch (error: any) {
    if (error.message === 'Project not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

export default router;
