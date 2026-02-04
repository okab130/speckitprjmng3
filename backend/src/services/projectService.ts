import { ProjectModel } from '../models/Project';
import { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput, 
  ProjectSearchFilters 
} from '../types/project';

export class ProjectService {
  /**
   * Create a new project
   */
  static async createProject(data: CreateProjectInput, createdBy: string): Promise<Project> {
    return await ProjectModel.create(data, createdBy);
  }

  /**
   * Get all projects with optional filtering
   */
  static async getAllProjects(filters?: ProjectSearchFilters): Promise<Project[]> {
    return await ProjectModel.findAll(filters);
  }

  /**
   * Get project by ID
   */
  static async getProjectById(id: string): Promise<Project> {
    const project = await ProjectModel.findById(id);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    return project;
  }

  /**
   * Update project
   */
  static async updateProject(id: string, data: UpdateProjectInput): Promise<Project> {
    // Verify project exists
    await this.getProjectById(id);
    
    return await ProjectModel.update(id, data);
  }

  /**
   * Delete project
   */
  static async deleteProject(id: string): Promise<void> {
    // Verify project exists
    await this.getProjectById(id);
    
    const deleted = await ProjectModel.delete(id);
    
    if (!deleted) {
      throw new Error('Failed to delete project');
    }
  }

  /**
   * Get project statistics
   */
  static async getProjectStatistics(id: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    totalIssues: number;
    openIssues: number;
  }> {
    // Verify project exists
    await this.getProjectById(id);
    
    return await ProjectModel.getStatistics(id);
  }
}
