import { query } from '../db/queryHelpers';
import { 
  Task, 
  TaskWithCreator, 
  CreateTaskInput, 
  UpdateTaskInput, 
  TaskSearchFilters 
} from '../types/task';

export class TaskModel {
  /**
   * Create a new task
   */
  static async create(data: CreateTaskInput, creatorId: string): Promise<Task> {
    const result = await query<Task>(
      `INSERT INTO prjmng3.tasks (
        title, 
        description, 
        status, 
        creator_id,
        start_date,
        end_date,
        phase,
        function_id,
        assignee_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
        id, 
        title, 
        description, 
        status, 
        creator_id as "creatorId",
        start_date as "startDate",
        end_date as "endDate",
        phase,
        function_id as "functionId",
        assignee_id as "assigneeId",
        version,
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [
        data.title,
        data.description || null,
        data.status || 'To Do',
        creatorId,
        data.startDate || null,
        data.endDate || null,
        data.phase || null,
        data.functionId || null,
        data.assigneeId || null
      ]
    );

    return result.rows[0];
  }

  /**
   * Find all tasks with optional filters
   */
  static async findAll(filters?: TaskSearchFilters): Promise<TaskWithCreator[]> {
    let queryText = `
      SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.status, 
        t.creator_id as "creatorId",
        t.start_date as "startDate",
        t.end_date as "endDate",
        t.phase,
        t.function_id as "functionId",
        t.assignee_id as "assigneeId",
        t.version,
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        creator.name as "creatorName",
        creator.email as "creatorEmail",
        assignee.name as "assigneeName",
        assignee.email as "assigneeEmail",
        f.system_name as "systemName",
        f.function_name as "functionName",
        f.function_detail as "functionDetail"
      FROM prjmng3.tasks t
      INNER JOIN prjmng3.users creator ON t.creator_id = creator.id
      LEFT JOIN prjmng3.users assignee ON t.assignee_id = assignee.id
      LEFT JOIN prjmng3.functions f ON t.function_id = f.id
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    // Apply filters
    if (filters?.query) {
      queryText += ` AND (t.title ILIKE $${paramIndex} OR t.description ILIKE $${paramIndex})`;
      params.push(`%${filters.query}%`);
      paramIndex++;
    }

    if (filters?.status) {
      queryText += ` AND t.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.creatorId) {
      queryText += ` AND t.creator_id = $${paramIndex}`;
      params.push(filters.creatorId);
      paramIndex++;
    }

    if (filters?.startDateFrom) {
      queryText += ` AND t.start_date >= $${paramIndex}`;
      params.push(filters.startDateFrom);
      paramIndex++;
    }

    if (filters?.endDateTo) {
      queryText += ` AND t.end_date <= $${paramIndex}`;
      params.push(filters.endDateTo);
      paramIndex++;
    }

    if (filters?.phase) {
      queryText += ` AND t.phase = $${paramIndex}`;
      params.push(filters.phase);
      paramIndex++;
    }

    if (filters?.functionId) {
      queryText += ` AND t.function_id = $${paramIndex}`;
      params.push(filters.functionId);
      paramIndex++;
    }

    if (filters?.assigneeId) {
      queryText += ` AND t.assignee_id = $${paramIndex}`;
      params.push(filters.assigneeId);
      paramIndex++;
    }

    queryText += ' ORDER BY t.created_at DESC';

    const result = await query<TaskWithCreator>(queryText, params);
    return result.rows;
  }

  /**
   * Find task by ID
   */
  static async findById(id: string): Promise<TaskWithCreator | null> {
    const result = await query<TaskWithCreator>(
      `SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.status, 
        t.creator_id as "creatorId",
        t.start_date as "startDate",
        t.end_date as "endDate",
        t.phase,
        t.function_id as "functionId",
        t.assignee_id as "assigneeId",
        t.version,
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        creator.name as "creatorName",
        creator.email as "creatorEmail",
        assignee.name as "assigneeName",
        assignee.email as "assigneeEmail",
        f.system_name as "systemName",
        f.function_name as "functionName",
        f.function_detail as "functionDetail"
      FROM prjmng3.tasks t
      INNER JOIN prjmng3.users creator ON t.creator_id = creator.id
      LEFT JOIN prjmng3.users assignee ON t.assignee_id = assignee.id
      LEFT JOIN prjmng3.functions f ON t.function_id = f.id
      WHERE t.id = $1`,
      [id]
    );

    return result.rows[0] || null;
  }

  /**
   * Update task with optimistic locking
   * Returns null if version mismatch (conflict)
   */
  static async update(id: string, data: UpdateTaskInput): Promise<Task | null> {
    const result = await query<Task>(
      `UPDATE prjmng3.tasks
      SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        start_date = COALESCE($4, start_date),
        end_date = COALESCE($5, end_date),
        phase = COALESCE($6, phase),
        function_id = COALESCE($7, function_id),
        assignee_id = COALESCE($8, assignee_id),
        version = version + 1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 AND version = $10
      RETURNING 
        id, 
        title, 
        description, 
        status, 
        creator_id as "creatorId",
        start_date as "startDate",
        end_date as "endDate",
        phase,
        function_id as "functionId",
        assignee_id as "assigneeId",
        version,
        created_at as "createdAt",
        updated_at as "updatedAt"`,
      [
        data.title,
        data.description,
        data.status,
        data.startDate,
        data.endDate,
        data.phase,
        data.functionId,
        data.assigneeId,
        id,
        data.version
      ]
    );

    return result.rows[0] || null;
  }

  /**
   * Delete task by ID
   */
  static async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM prjmng3.tasks WHERE id = $1',
      [id]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  /**
   * Check if task exists
   */
  static async exists(id: string): Promise<boolean> {
    const result = await query(
      'SELECT 1 FROM prjmng3.tasks WHERE id = $1',
      [id]
    );

    return result.rows.length > 0;
  }

  /**
   * Get current version of a task
   */
  static async getVersion(id: string): Promise<number | null> {
    const result = await query<{ version: number }>(
      'SELECT version FROM prjmng3.tasks WHERE id = $1',
      [id]
    );

    return result.rows[0]?.version || null;
  }

  /**
   * Get tasks grouped by status for Kanban board view
   * Returns tasks ordered by creation date within each status
   */
  static async findAllGroupedByStatus(): Promise<Record<string, TaskWithCreator[]>> {
    const result = await query<TaskWithCreator>(
      `SELECT 
        t.id, 
        t.title, 
        t.description, 
        t.status, 
        t.creator_id as "creatorId",
        t.start_date as "startDate",
        t.end_date as "endDate",
        t.phase,
        t.function_id as "functionId",
        t.assignee_id as "assigneeId",
        t.version,
        t.created_at as "createdAt",
        t.updated_at as "updatedAt",
        creator.name as "creatorName",
        creator.email as "creatorEmail",
        assignee.name as "assigneeName",
        assignee.email as "assigneeEmail",
        f.system_name as "systemName",
        f.function_name as "functionName",
        f.function_detail as "functionDetail"
      FROM prjmng3.tasks t
      INNER JOIN prjmng3.users creator ON t.creator_id = creator.id
      LEFT JOIN prjmng3.users assignee ON t.assignee_id = assignee.id
      LEFT JOIN prjmng3.functions f ON t.function_id = f.id
      ORDER BY t.status, t.created_at ASC`,
      []
    );

    // Group tasks by status
    const grouped: Record<string, TaskWithCreator[]> = {
      'To Do': [],
      'In Progress': [],
      'Complete': []
    };

    result.rows.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }
}
