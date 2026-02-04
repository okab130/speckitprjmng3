export type TaskStatus = 'To Do' | 'In Progress' | 'Complete';
export type Phase = '要件定義' | '設計' | '製造' | 'テスト' | '本番移行';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  creatorId: string;
  startDate?: Date;
  endDate?: Date;
  phase?: Phase;
  functionId?: string;
  assigneeId?: string;
  projectId?: string;
  completedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskWithCreator extends Task {
  creatorName: string;
  creatorEmail: string;
  assigneeName?: string;
  assigneeEmail?: string;
  systemName?: string;
  functionName?: string;
  functionDetail?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  startDate?: Date;
  endDate?: Date;
  phase?: Phase;
  functionId?: string;
  assigneeId?: string;
  projectId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  startDate?: Date;
  endDate?: Date;
  phase?: Phase;
  functionId?: string;
  assigneeId?: string;
  projectId?: string;
  version: number; // Required for optimistic locking
}

export interface TaskSearchFilters {
  query?: string; // Search in title/description
  status?: TaskStatus;
  creatorId?: string;
  startDateFrom?: Date;
  endDateTo?: Date;
  phase?: Phase;
  functionId?: string;
  assigneeId?: string;
  projectId?: string;
}
