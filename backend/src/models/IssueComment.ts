import pool from '../db/connection';

export interface IssueComment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueCommentWithUser extends IssueComment {
  userName: string;
  userEmail: string;
}

/**
 * IssueComment Model
 * Handles database operations for issue comments (response history)
 */
export class IssueCommentModel {
  /**
   * Create a new comment
   */
  static async create(
    issueId: string,
    userId: string,
    content: string
  ): Promise<IssueCommentWithUser> {
    const query = `
      INSERT INTO prjmng3.issue_comments (issue_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING 
        id, issue_id, user_id, content, created_at, updated_at
    `;

    const result = await pool.query(query, [issueId, userId, content]);
    const comment = result.rows[0];
    
    // Fetch user information
    const userQuery = `
      SELECT name, email FROM prjmng3.users WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);
    const user = userResult.rows[0];
    
    return this.mapRowToCommentWithUser(comment, user);
  }

  /**
   * Find all comments for an issue
   */
  static async findByIssueId(issueId: string): Promise<IssueCommentWithUser[]> {
    const query = `
      SELECT 
        c.id, c.issue_id, c.user_id, c.content, c.created_at, c.updated_at,
        u.name as user_name, u.email as user_email
      FROM prjmng3.issue_comments c
      INNER JOIN prjmng3.users u ON c.user_id = u.id
      WHERE c.issue_id = $1
      ORDER BY c.created_at ASC
    `;

    const result = await pool.query(query, [issueId]);
    
    return result.rows.map(row => ({
      id: row.id,
      issueId: row.issue_id,
      userId: row.user_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userName: row.user_name,
      userEmail: row.user_email,
    }));
  }

  /**
   * Update a comment
   */
  static async update(
    id: string,
    userId: string,
    content: string
  ): Promise<IssueCommentWithUser | null> {
    const query = `
      UPDATE prjmng3.issue_comments
      SET content = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING id, issue_id, user_id, content, created_at, updated_at
    `;

    const result = await pool.query(query, [content, id, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const comment = result.rows[0];
    
    // Fetch user information
    const userQuery = `
      SELECT name, email FROM prjmng3.users WHERE id = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);
    const user = userResult.rows[0];
    
    return this.mapRowToCommentWithUser(comment, user);
  }

  /**
   * Delete a comment
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    const query = `
      DELETE FROM prjmng3.issue_comments
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [id, userId]);
    
    return result.rows.length > 0;
  }

  /**
   * Map database row to IssueCommentWithUser object
   */
  private static mapRowToCommentWithUser(row: any, user: any): IssueCommentWithUser {
    return {
      id: row.id,
      issueId: row.issue_id,
      userId: row.user_id,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      userName: user.name,
      userEmail: user.email,
    };
  }
}
