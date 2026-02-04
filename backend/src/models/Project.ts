import { query } from '../db/queryHelpers';
import { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput, 
  ProjectSearchFilters 
} from '../types/project';

export class ProjectModel {
  /**
   * Create a new project
   */
  static async create(data: CreateProjectInput, createdBy: string): Promise<Project> {
    const result = await query<Project>(
      `INSERT INTO prjmng3.projects (
        name,
        description,
        status,
        created_by
      )
      VALUES ($1, $2, $3, $4)
      RETURNING 
        id,
        name,
        description,
        status,
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt",
        version`,
      [
        data.name,
        data.description || null,
        data.status || 'Active',
        createdBy,
      ]
    );

    return result.rows[0];
  }

  /**
   * Find all projects with optional filtering
   */
  static async findAll(filters?: ProjectSearchFilters): Promise<Project[]> {
    let queryText = `
      SELECT 
        id,
        name,
        description,
        status,
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt",
        version
      FROM prjmng3.projects
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      queryText += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.createdBy) {
      queryText += ` AND created_by = $${paramIndex}`;
      params.push(filters.createdBy);
      paramIndex++;
    }

    queryText += ` ORDER BY created_at DESC`;

    const result = await query<Project>(queryText, params);
    return result.rows;
  }

  /**
   * Find project by ID
   */
  static async findById(id: string): Promise<Project | null> {
    const result = await query<Project>(
      `SELECT 
        id,
        name,
        description,
        status,
        created_by as "createdBy",
        created_at as "createdAt",
        updated_at as "updatedAt",
        version
      FROM prjmng3.projects
      WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Update project with optimistic locking
   */
  static async update(id: string, data: UpdateProjectInput): Promise<Project> {
    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      params.push(data.name);
      paramIndex++;
    }

    if (data.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      params.push(data.description);
      paramIndex++;
    }

    if (data.status !== undefined) {
      updates.push(`status = $${paramIndex}`);
      params.push(data.status);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    // Increment version
    updates.push(`version = version + 1`);

    // Add WHERE clause for ID and version (optimistic locking)
    params.push(id, data.version);

    const result = await query<Project>(
      `UPDATE prjmng3.projects
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND version = $${paramIndex + 1}
       RETURNING 
         id,
         name,
         description,
         status,
         created_by as "createdBy",
         created_at as "createdAt",
         updated_at as "updatedAt",
         version`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('Project not found or was modified by another user. Please refresh and try again.');
    }

    return result.rows[0];
  }

  /**
   * Delete project
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      `DELETE FROM prjmng3.projects WHERE id = $1`,
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Get project statistics
   */
  static async getStatistics(projectId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    totalIssues: number;
    openIssues: number;
  }> {
    const result = await query<{
      totalTasks: string;
      completedTasks: string;
      inProgressTasks: string;
      totalIssues: string;
      openIssues: string;
    }>(
      `SELECT 
        (SELECT COUNT(*) FROM prjmng3.tasks WHERE project_id = $1) as "totalTasks",
        (SELECT COUNT(*) FROM prjmng3.tasks WHERE project_id = $1 AND status = 'Complete') as "completedTasks",
        (SELECT COUNT(*) FROM prjmng3.tasks WHERE project_id = $1 AND status = 'In Progress') as "inProgressTasks",
        (SELECT COUNT(*) FROM prjmng3.issues WHERE project_id = $1) as "totalIssues",
        (SELECT COUNT(*) FROM prjmng3.issues WHERE project_id = $1 AND status = 'Open') as "openIssues"`,
      [projectId]
    );

    const row = result.rows[0];
    return {
      totalTasks: parseInt(row.totalTasks),
      completedTasks: parseInt(row.completedTasks),
      inProgressTasks: parseInt(row.inProgressTasks),
      totalIssues: parseInt(row.totalIssues),
      openIssues: parseInt(row.openIssues),
    };
  }
}
