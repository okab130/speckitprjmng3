import { Router, Request, Response } from 'express';
import { FunctionModel } from '../models/Function';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

// Apply authentication to all function routes
router.use(authenticate);

// GET /api/functions - Get all functions
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const functions = await FunctionModel.getAll();
    res.json(functions);
  } catch (error) {
    console.error('Error fetching functions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/functions/systems - Get distinct system names
router.get('/systems', async (req: AuthRequest, res: Response) => {
  try {
    const systems = await FunctionModel.getSystemNames();
    res.json(systems);
  } catch (error) {
    console.error('Error fetching system names:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/functions/systems/:systemName/functions - Get function names by system
router.get('/systems/:systemName/functions', async (req: AuthRequest, res: Response) => {
  try {
    const { systemName } = req.params;
    const functions = await FunctionModel.getFunctionNamesBySystem(systemName);
    res.json(functions);
  } catch (error) {
    console.error('Error fetching function names:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/functions/systems/:systemName/functions/:functionName/details - Get function details
router.get('/systems/:systemName/functions/:functionName/details', async (req: AuthRequest, res: Response) => {
  try {
    const { systemName, functionName } = req.params;
    const details = await FunctionModel.getFunctionDetails(systemName, functionName);
    res.json(details);
  } catch (error) {
    console.error('Error fetching function details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/functions - Create new function
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { system_name, function_name, function_detail } = req.body;

    // Validation
    if (!system_name || !function_name || !function_detail) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newFunction = await FunctionModel.create({
      system_name,
      function_name,
      function_detail
    });

    res.status(201).json(newFunction);
  } catch (error: any) {
    console.error('Error creating function:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Function already exists' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/functions/:id - Delete function
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await FunctionModel.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Function not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting function:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
