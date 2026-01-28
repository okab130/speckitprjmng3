import { IssueModel } from '../models/Issue';
import { TaskIssueModel } from '../models/TaskIssue';
import { Issue } from '../types/issue';

/**
 * Issue Service
 * Business logic for issue management
 */
export class IssueService {
  /**
   * Create a new issue
   */
  static async createIssue(
    title: string,
    description: string,
    status: string,
    severity: string,
    creatorId: string,
    dueDate?: Date
  ): Promise<Issue> {
    // Validate status
    const validStatuses = ['To Do', 'In Progress', 'Complete'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Validate severity
    const validSeverities = ['Low', 'Medium', 'High'];
    if (!validSeverities.includes(severity)) {
      throw new Error(`Invalid severity: ${severity}. Must be one of: ${validSeverities.join(', ')}`);
    }

    return await IssueModel.create(title, description, status, severity, creatorId, dueDate);
  }

  /**
   * Get all issues with optional filters
   */
  static async getIssues(filters?: {
    status?: string;
    severity?: string;
    creatorId?: string;
  }): Promise<Issue[]> {
    return await IssueModel.findAll(filters);
  }

  /**
   * Get issue by ID
   */
  static async getIssueById(id: string): Promise<Issue | null> {
    return await IssueModel.findById(id);
  }

  /**
   * Update an issue
   */
  static async updateIssue(
    id: string,
    updates: {
      title?: string;
      description?: string;
      status?: string;
      severity?: string;
      dueDate?: Date;
    }
  ): Promise<Issue | null> {
    // Validate status if provided
    if (updates.status) {
      const validStatuses = ['To Do', 'In Progress', 'Complete'];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    // Validate severity if provided
    if (updates.severity) {
      const validSeverities = ['Low', 'Medium', 'High'];
      if (!validSeverities.includes(updates.severity)) {
        throw new Error(`Invalid severity: ${updates.severity}. Must be one of: ${validSeverities.join(', ')}`);
      }
    }

    return await IssueModel.update(id, updates);
  }

  /**
   * Delete an issue
   */
  static async deleteIssue(id: string): Promise<boolean> {
    // First, delete all task-issue links
    await TaskIssueModel.deleteAllLinksForIssue(id);

    // Then delete the issue
    return await IssueModel.delete(id);
  }

  /**
   * Link an issue to a task
   */
  static async linkIssueToTask(taskId: string, issueId: string): Promise<void> {
    // Verify issue exists
    const issue = await IssueModel.findById(issueId);
    if (!issue) {
      throw new Error(`Issue with id ${issueId} not found`);
    }

    // Note: Task existence will be checked by foreign key constraint
    await TaskIssueModel.linkIssueToTask(taskId, issueId);
  }

  /**
   * Unlink an issue from a task
   */
  static async unlinkIssueFromTask(taskId: string, issueId: string): Promise<boolean> {
    return await TaskIssueModel.unlinkIssueFromTask(taskId, issueId);
  }

  /**
   * Get all issues linked to a task
   */
  static async getIssuesForTask(taskId: string): Promise<Issue[]> {
    return await TaskIssueModel.getIssuesForTask(taskId);
  }

  /**
   * Get all task IDs linked to an issue
   */
  static async getTasksForIssue(issueId: string): Promise<string[]> {
    return await TaskIssueModel.getTasksForIssue(issueId);
  }
}
