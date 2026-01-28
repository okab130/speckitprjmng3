import pool from '../db/connection';
import { Issue } from '../types/issue';

/**
 * TaskIssue Model
 * Handles many-to-many relationship between tasks and issues
 */
export class TaskIssueModel {
  /**
   * Link an issue to a task
   */
  static async linkIssueToTask(taskId: string, issueId: string): Promise<void> {
    const query = `
      INSERT INTO prjmng3.task_issues (task_id, issue_id)
      VALUES ($1, $2)
      ON CONFLICT (task_id, issue_id) DO NOTHING
    `;

    await pool.query(query, [taskId, issueId]);
  }

  /**
   * Unlink an issue from a task
   */
  static async unlinkIssueFromTask(taskId: string, issueId: string): Promise<boolean> {
    const query = `
      DELETE FROM prjmng3.task_issues
      WHERE task_id = $1 AND issue_id = $2
      RETURNING task_id
    `;

    const result = await pool.query(query, [taskId, issueId]);
    
    return result.rows.length > 0;
  }

  /**
   * Get all issues linked to a task
   */
  static async getIssuesForTask(taskId: string): Promise<Issue[]> {
    const query = `
      SELECT i.id, i.title, i.description, i.status, i.severity, i.creator_id, i.created_at, i.resolved_at
      FROM prjmng3.issues i
      INNER JOIN prjmng3.task_issues ti ON ti.issue_id = i.id
      WHERE ti.task_id = $1
      ORDER BY i.created_at DESC
    `;

    const result = await pool.query(query, [taskId]);
    
    return result.rows.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      severity: row.severity,
      creatorId: row.creator_id,
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
    }));
  }

  /**
   * Get all tasks linked to an issue
   */
  static async getTasksForIssue(issueId: string): Promise<string[]> {
    const query = `
      SELECT task_id
      FROM prjmng3.task_issues
      WHERE issue_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [issueId]);
    
    return result.rows.map(row => row.task_id);
  }

  /**
   * Check if an issue is linked to a task
   */
  static async isLinked(taskId: string, issueId: string): Promise<boolean> {
    const query = `
      SELECT 1
      FROM prjmng3.task_issues
      WHERE task_id = $1 AND issue_id = $2
    `;

    const result = await pool.query(query, [taskId, issueId]);
    
    return result.rows.length > 0;
  }

  /**
   * Get count of issues linked to a task
   */
  static async getIssueCountForTask(taskId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM prjmng3.task_issues
      WHERE task_id = $1
    `;

    const result = await pool.query(query, [taskId]);
    
    return parseInt(result.rows[0].count, 10);
  }

  /**
   * Delete all links for a task (used when task is deleted)
   */
  static async deleteAllLinksForTask(taskId: string): Promise<void> {
    const query = `
      DELETE FROM prjmng3.task_issues
      WHERE task_id = $1
    `;

    await pool.query(query, [taskId]);
  }

  /**
   * Delete all links for an issue (used when issue is deleted)
   */
  static async deleteAllLinksForIssue(issueId: string): Promise<void> {
    const query = `
      DELETE FROM prjmng3.task_issues
      WHERE issue_id = $1
    `;

    await pool.query(query, [issueId]);
  }
}
