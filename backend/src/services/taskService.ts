import { TaskModel } from '../models/Task';
import { 
  Task, 
  TaskWithCreator, 
  CreateTaskInput, 
  UpdateTaskInput, 
  TaskSearchFilters 
} from '../types/task';

export class TaskService {
  /**
   * Validate status transition for Kanban board
   * Ensures only valid status changes are allowed
   */
  private static validateStatusTransition(currentStatus: string, newStatus: string): void {
    const validStatuses = ['To Do', 'In Progress', 'Complete'];
    
    // Validate that both statuses are valid
    if (!validStatuses.includes(currentStatus) || !validStatuses.includes(newStatus)) {
      throw new Error('Invalid status value');
    }

    // Allow any transition for flexibility
    // In a more complex system, you might restrict certain transitions
    // For example: Can't go from Complete back to To Do without approval
  }

  /**
   * Create a new task
   */
  static async createTask(data: CreateTaskInput, creatorId: string): Promise<Task> {
    // Validate date range if both dates are provided
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (startDate > endDate) {
        throw new Error('Start date must be before or equal to end date');
      }
    }

    return await TaskModel.create(data, creatorId);
  }

  /**
   * Get all tasks with optional filtering
   */
  static async getAllTasks(filters?: TaskSearchFilters): Promise<TaskWithCreator[]> {
    return await TaskModel.findAll(filters);
  }

  /**
   * Get task by ID
   */
  static async getTaskById(id: string): Promise<TaskWithCreator> {
    const task = await TaskModel.findById(id);
    
    if (!task) {
      throw new Error('Task not found');
    }

    return task;
  }

  /**
   * Update task with optimistic locking
   * Throws error on version mismatch
   */
  static async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    // Validate task exists and get current state
    const currentTask = await TaskModel.findById(id);
    if (!currentTask) {
      throw new Error('Task not found');
    }

    // Validate status transition if status is being changed
    if (data.status && data.status !== currentTask.status) {
      this.validateStatusTransition(currentTask.status, data.status);
    }

    // Validate date range if both dates are provided
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (startDate > endDate) {
        throw new Error('Start date must be before or equal to end date');
      }
    }

    // Attempt update with optimistic locking
    const updatedTask = await TaskModel.update(id, data);

    if (!updatedTask) {
      // Version mismatch - concurrent update detected
      throw new Error('Task was modified by another user. Please refresh and try again.');
    }

    return updatedTask;
  }

  /**
   * Delete task
   */
  static async deleteTask(id: string): Promise<void> {
    const deleted = await TaskModel.delete(id);
    
    if (!deleted) {
      throw new Error('Task not found');
    }
  }

  /**
   * Get current version of a task
   */
  static async getTaskVersion(id: string): Promise<number> {
    const version = await TaskModel.getVersion(id);
    
    if (version === null) {
      throw new Error('Task not found');
    }

    return version;
  }

  /**
   * Check if task exists
   */
  static async taskExists(id: string): Promise<boolean> {
    return await TaskModel.exists(id);
  }

  /**
   * Get tasks grouped by status for Kanban board
   * Returns tasks organized by status columns
   */
  static async getTasksGroupedByStatus(): Promise<Record<string, TaskWithCreator[]>> {
    return await TaskModel.findAllGroupedByStatus();
  }
}
