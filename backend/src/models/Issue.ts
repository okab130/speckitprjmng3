import pool from '../db/connection';
import { Issue } from '../types/issue';

/**
 * Issue Model
 * Handles database operations for issues
 */
export class IssueModel {
  /**
   * Create a new issue
   */
  static async create(
    title: string,
    description: string,
    status: string,
    severity: string,
    creatorId: string,
    dueDate?: Date
  ): Promise<Issue> {
    const query = `
      INSERT INTO prjmng3.issues (title, description, status, severity, creator_id, due_date)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, title, description, status, severity, creator_id, created_at, due_date, resolved_at
    `;

    const result = await pool.query(query, [title, description, status, severity, creatorId, dueDate]);
    
    return this.mapRowToIssue(result.rows[0]);
  }

  /**
   * Find all issues with optional filters
   */
  static async findAll(filters?: {
    status?: string;
    severity?: string;
    creatorId?: string;
  }): Promise<Issue[]> {
    let query = `
      SELECT id, title, description, status, severity, creator_id, created_at, due_date, resolved_at
      FROM prjmng3.issues
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.severity) {
      query += ` AND severity = $${paramIndex}`;
      params.push(filters.severity);
      paramIndex++;
    }

    if (filters?.creatorId) {
      query += ` AND creator_id = $${paramIndex}`;
      params.push(filters.creatorId);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    
    return result.rows.map(row => this.mapRowToIssue(row));
  }

  /**
   * Find issue by ID
   */
  static async findById(id: string): Promise<Issue | null> {
    const query = `
      SELECT id, title, description, status, severity, creator_id, created_at, due_date, resolved_at
      FROM prjmng3.issues
      WHERE id = $1
    `;

    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToIssue(result.rows[0]);
  }

  /**
   * Update an issue
   */
  static async update(
    id: string,
    updates: {
      title?: string;
      description?: string;
      status?: string;
      severity?: string;
      dueDate?: Date;
    }
  ): Promise<Issue | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramIndex}`);
      values.push(updates.title);
      paramIndex++;
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex}`);
      values.push(updates.description);
      paramIndex++;
    }

    if (updates.status !== undefined) {
      fields.push(`status = $${paramIndex}`);
      values.push(updates.status);
      paramIndex++;

      // Set resolved_at when status changes to 'Complete'
      if (updates.status === 'Complete') {
        fields.push(`resolved_at = CURRENT_TIMESTAMP`);
      } else if (updates.status === 'To Do' || updates.status === 'In Progress') {
        // Clear resolved_at when status changes back
        fields.push(`resolved_at = NULL`);
      }
    }

    if (updates.severity !== undefined) {
      fields.push(`severity = $${paramIndex}`);
      values.push(updates.severity);
      paramIndex++;
    }

    if (updates.dueDate !== undefined) {
      fields.push(`due_date = $${paramIndex}`);
      values.push(updates.dueDate);
      paramIndex++;
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);

    const query = `
      UPDATE prjmng3.issues
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, title, description, status, severity, creator_id, created_at, due_date, resolved_at
    `;

    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToIssue(result.rows[0]);
  }

  /**
   * Delete an issue
   */
  static async delete(id: string): Promise<boolean> {
    const query = `
      DELETE FROM prjmng3.issues
      WHERE id = $1
      RETURNING id
    `;

    const result = await pool.query(query, [id]);
    
    return result.rows.length > 0;
  }

  /**
   * Map database row to Issue object
   */
  private static mapRowToIssue(row: any): Issue {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      severity: row.severity,
      creatorId: row.creator_id,
      createdAt: row.created_at,
      dueDate: row.due_date,
      resolvedAt: row.resolved_at,
    };
  }
}
