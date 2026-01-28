import { IssueCommentModel, IssueCommentWithUser } from '../models/IssueComment';

/**
 * Issue Comment Service
 * Business logic for issue comments (response history)
 */
export class IssueCommentService {
  /**
   * Create a new comment
   */
  async createComment(
    issueId: string,
    userId: string,
    content: string
  ): Promise<IssueCommentWithUser> {
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }

    if (content.length > 10000) {
      throw new Error('Comment content is too long (max 10000 characters)');
    }

    return await IssueCommentModel.create(issueId, userId, content.trim());
  }

  /**
   * Get all comments for an issue
   */
  async getCommentsByIssueId(issueId: string): Promise<IssueCommentWithUser[]> {
    return await IssueCommentModel.findByIssueId(issueId);
  }

  /**
   * Update a comment
   */
  async updateComment(
    id: string,
    userId: string,
    content: string
  ): Promise<IssueCommentWithUser> {
    // Validate content
    if (!content || content.trim().length === 0) {
      throw new Error('Comment content cannot be empty');
    }

    if (content.length > 10000) {
      throw new Error('Comment content is too long (max 10000 characters)');
    }

    const updated = await IssueCommentModel.update(id, userId, content.trim());
    
    if (!updated) {
      throw new Error('Comment not found or you do not have permission to update it');
    }

    return updated;
  }

  /**
   * Delete a comment
   */
  async deleteComment(id: string, userId: string): Promise<void> {
    const deleted = await IssueCommentModel.delete(id, userId);
    
    if (!deleted) {
      throw new Error('Comment not found or you do not have permission to delete it');
    }
  }
}

export const issueCommentService = new IssueCommentService();
