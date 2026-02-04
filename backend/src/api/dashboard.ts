import { Router, Request, Response } from 'express';
import { DashboardModel } from '../models/Dashboard';

const router = Router();

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const projectId = req.query.projectId as string | undefined;
    
    const stats = await DashboardModel.getStats(projectId);
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
