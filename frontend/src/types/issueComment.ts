export interface IssueComment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userName: string;
  userEmail: string;
}

export interface CreateIssueCommentInput {
  content: string;
}

export interface UpdateIssueCommentInput {
  content: string;
}
