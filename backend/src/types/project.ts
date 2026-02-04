export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export type ProjectStatus = 'Active' | 'Archived' | 'Completed';

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
