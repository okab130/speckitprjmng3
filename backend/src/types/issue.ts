export type IssueStatus = 'To Do' | 'In Progress' | 'Complete';
export type IssueSeverity = 'Low' | 'Medium' | 'High';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  severity: IssueSeverity;
  creatorId: string;
  createdAt: Date;
  dueDate?: Date;
  resolvedAt?: Date;
  projectId?: string;
}

export interface IssueWithCreator extends Issue {
  creatorName: string;
  creatorEmail: string;
}

export interface CreateIssueInput {
  title: string;
  description: string;
  severity?: IssueSeverity;
  dueDate?: Date;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  status?: IssueStatus;
  severity?: IssueSeverity;
  dueDate?: Date;
}

export interface IssueSearchFilters {
  query?: string; // Search in title/description
  status?: IssueStatus;
  severity?: IssueSeverity;
  creatorId?: string;
}
