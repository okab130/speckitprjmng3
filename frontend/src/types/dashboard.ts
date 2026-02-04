export interface DashboardStats {
  // Task cumulative data
  cumulativePlannedCompletions: Array<{ date: string; count: number }>;
  cumulativeActualCompletions: Array<{ date: string; count: number }>;
  
  // Task stats
  todayPlannedTasks: number;
  todayCompletedTasks: number;
  totalTasks: number;
  taskCompletionRate: number;
  taskAchievementRate: number;
  
  // Issue stats
  issuesCreated: number;
  issuesCompleted: number;
  totalIssues: number;
  issueCompletionRate: number;
  issueAchievementRate: number;
  
  // Issue cumulative data
  cumulativeIssuesCreated: Array<{ date: string; count: number }>;
  cumulativeIssuesCompleted: Array<{ date: string; count: number }>;
}
