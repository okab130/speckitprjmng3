export type IssueStatus = 'To Do' | 'In Progress' | 'Complete';
export type IssueSeverity = 'Low' | 'Medium' | 'High';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  severity: IssueSeverity;
  creatorId: string;
  creatorName?: string;
  creatorEmail?: string;
  createdAt: string;
  dueDate?: string;
  resolvedAt?: string;
  projectId?: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  severity?: IssueSeverity;
  dueDate?: string;
  projectId?: string;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  status?: IssueStatus;
  severity?: IssueSeverity;
  dueDate?: string;
  projectId?: string;
}

export interface IssueSearchFilters {
  query?: string;
  status?: IssueStatus;
  severity?: IssueSeverity;
  creatorId?: string;
  projectId?: string;
}
