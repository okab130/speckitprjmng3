export type TaskStatus = 'To Do' | 'In Progress' | 'Complete';
export type Phase = '要件定義' | '設計' | '製造' | 'テスト' | '本番移行';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  creatorId: string;
  creatorName?: string;
  creatorEmail?: string;
  startDate?: string | Date;  // Accept both string and Date
  endDate?: string | Date;    // Accept both string and Date
  phase?: Phase;
  functionId?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneeEmail?: string;
  systemName?: string;
  functionName?: string;
  functionDetail?: string;
  projectId?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// TaskWithCreator is the same as Task with required creator fields
export interface TaskWithCreator extends Task {
  creatorName: string;
  creatorEmail: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  startDate?: string;
  endDate?: string;
  phase?: Phase;
  functionId?: string;
  assigneeId?: string;
  projectId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  startDate?: string;
  endDate?: string;
  phase?: Phase;
  functionId?: string;
  assigneeId?: string;
  projectId?: string;
  version: number;
}

export interface TaskSearchFilters {
  query?: string;
  status?: TaskStatus;
  creatorId?: string;
  startDateFrom?: string;
  endDateTo?: string;
  phase?: Phase;
  functionId?: string;
  assigneeId?: string;
  projectId?: string;
}
