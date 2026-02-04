export interface DashboardStats {
  // Task cumulative data
  cumulativePlannedCompletions: Array<{ date: string; count: number }>;
  cumulativeActualCompletions: Array<{ date: string; count: number }>;
  
  // Task stats
  todayPlannedTasks: number;
  todayCompletedTasks: number;
  totalTasks: number;
  taskCompletionRate: number; // completedTasks / totalTasks
  taskAchievementRate: number; // completedTasks / plannedTasks
  
  // Issue stats
  issuesCreated: number;
  issuesCompleted: number;
  totalIssues: number;
  issueCompletionRate: number; // completedIssues / totalIssues
  issueAchievementRate: number; // completedIssues / plannedIssues (due today)
  
  // Issue cumulative data
  cumulativeIssuesCreated: Array<{ date: string; count: number }>;
  cumulativeIssuesCompleted: Array<{ date: string; count: number }>;
}
