import { Router, Response } from 'express';
import { query } from '../db/queryHelpers';
import { authenticate, AuthRequest } from '../middleware/authenticate';

const router = Router();

// Apply authentication to all user routes
router.use(authenticate);

interface User {
  id: string;
  name: string;
  email: string;
  created_at: Date;
}

// GET /api/users - Get all users (for assignee selection)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const result = await query<User>(
      `SELECT id, name, email, created_at 
       FROM prjmng3.users 
       ORDER BY name ASC`,
      []
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
