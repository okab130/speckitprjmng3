import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/authenticate';
import { issueCommentService } from '../services/issueCommentService';
import { getIO } from '../websocket/server';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

/**
 * POST /api/issues/:issueId/comments
 * Create a new comment for an issue
 */
router.post('/:issueId/comments', async (req: AuthRequest, res: Response) => {
  try {
    const { issueId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await issueCommentService.createComment(issueId, userId, content);

    // Broadcast to all clients via WebSocket
    const io = getIO();
    if (io) {
      io.emit('issue:comment:created', {
        ...comment,
        issueId,
      });
    }

    res.status(201).json(comment);
  } catch (error: any) {
    console.error('Error creating issue comment:', error);
    res.status(500).json({ error: error.message || 'Failed to create comment' });
  }
});

/**
 * GET /api/issues/:issueId/comments
 * Get all comments for an issue
 */
router.get('/:issueId/comments', async (req: AuthRequest, res: Response) => {
  try {
    const { issueId } = req.params;

    const comments = await issueCommentService.getCommentsByIssueId(issueId);

    res.json(comments);
  } catch (error: any) {
    console.error('Error fetching issue comments:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch comments' });
  }
});

/**
 * PATCH /api/issues/:issueId/comments/:commentId
 * Update a comment
 */
router.patch('/:issueId/comments/:commentId', async (req: AuthRequest, res: Response) => {
  try {
    const { issueId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.userId;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const comment = await issueCommentService.updateComment(commentId, userId, content);

    // Broadcast to all clients
    const io = getIO();
    if (io) {
      io.emit('issue:comment:updated', {
        ...comment,
        issueId,
      });
    }

    res.json(comment);
  } catch (error: any) {
    console.error('Error updating issue comment:', error);
    res.status(400).json({ error: error.message || 'Failed to update comment' });
  }
});

/**
 * DELETE /api/issues/:issueId/comments/:commentId
 * Delete a comment
 */
router.delete('/:issueId/comments/:commentId', async (req: AuthRequest, res: Response) => {
  try {
    const { issueId, commentId } = req.params;
    const userId = req.user!.userId;

    await issueCommentService.deleteComment(commentId, userId);

    // Broadcast to all clients
    const io = getIO();
    if (io) {
      io.emit('issue:comment:deleted', {
        id: commentId,
        issueId,
      });
    }

    res.status(204).send();
  } catch (error: any) {
    console.error('Error deleting issue comment:', error);
    res.status(400).json({ error: error.message || 'Failed to delete comment' });
  }
});

export default router;
