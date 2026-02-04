export type ProjectStatus = 'Active' | 'Archived' | 'Completed';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  version: number;
}

export interface ProjectSearchFilters {
  status?: ProjectStatus;
  createdBy?: string;
}

export interface ProjectStatistics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalIssues: number;
  openIssues: number;
}
