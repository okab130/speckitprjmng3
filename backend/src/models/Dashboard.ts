import { query } from '../db/queryHelpers';
import { DashboardStats } from '../types/dashboard';

export class DashboardModel {
  /**
   * Get dashboard statistics
   */
  static async getStats(projectId?: string): Promise<DashboardStats> {
    const projectFilter = projectId ? 'AND project_id = $1' : '';
    const params = projectId ? [projectId] : [];

    // Get cumulative planned task completions by end_date
    const cumulativePlannedQuery = `
      SELECT 
        end_date::date as date,
        COUNT(*) as count
      FROM prjmng3.tasks
      WHERE end_date IS NOT NULL ${projectFilter}
      GROUP BY end_date::date
      ORDER BY date
    `;

    // Get cumulative actual task completions by completed_at
    const cumulativeActualQuery = `
      SELECT 
        completed_at::date as date,
        COUNT(*) as count
      FROM prjmng3.tasks
      WHERE completed_at IS NOT NULL ${projectFilter}
      GROUP BY completed_at::date
      ORDER BY date
    `;

    // Get task stats
    const taskStatsQuery = `
      SELECT
        COUNT(*) FILTER (WHERE end_date::date = CURRENT_DATE) as today_planned,
        COUNT(*) FILTER (WHERE completed_at::date = CURRENT_DATE) as today_completed,
        COUNT(*) as total_tasks,
        COUNT(*) FILTER (WHERE status = 'Complete') as completed_tasks,
        COUNT(*) FILTER (WHERE end_date::date <= CURRENT_DATE) as planned_by_today
      FROM prjmng3.tasks
      WHERE 1=1 ${projectFilter}
    `;

    // Get cumulative issues created
    const cumulativeIssuesCreatedQuery = `
      SELECT 
        created_at::date as date,
        COUNT(*) as count
      FROM prjmng3.issues
      WHERE 1=1 ${projectFilter}
      GROUP BY created_at::date
      ORDER BY date
    `;

    // Get cumulative issues completed
    const cumulativeIssuesCompletedQuery = `
      SELECT 
        resolved_at::date as date,
        COUNT(*) as count
      FROM prjmng3.issues
      WHERE resolved_at IS NOT NULL ${projectFilter}
      GROUP BY resolved_at::date
      ORDER BY date
    `;

    // Get issue stats
    const issueStatsQuery = `
      SELECT
        COUNT(*) as total_issues,
        COUNT(*) FILTER (WHERE status = 'Complete') as completed_issues,
        COUNT(*) FILTER (WHERE due_date::date <= CURRENT_DATE) as planned_by_today
      FROM prjmng3.issues
      WHERE 1=1 ${projectFilter}
    `;

    // Execute all queries
    const [
      plannedResult,
      actualResult,
      taskStatsResult,
      issuesCreatedResult,
      issuesCompletedResult,
      issueStatsResult
    ] = await Promise.all([
      query(cumulativePlannedQuery, params),
      query(cumulativeActualQuery, params),
      query(taskStatsQuery, params),
      query(cumulativeIssuesCreatedQuery, params),
      query(cumulativeIssuesCompletedQuery, params),
      query(issueStatsQuery, params)
    ]);

    // Transform cumulative data
    const cumulativePlanned = this.transformToCumulative(plannedResult.rows);
    const cumulativeActual = this.transformToCumulative(actualResult.rows);
    const cumulativeIssuesCreated = this.transformToCumulative(issuesCreatedResult.rows);
    const cumulativeIssuesCompleted = this.transformToCumulative(issuesCompletedResult.rows);

    // Extract task stats
    const taskStats = taskStatsResult.rows[0] || {
      today_planned: 0,
      today_completed: 0,
      total_tasks: 0,
      completed_tasks: 0,
      planned_by_today: 0
    };

    // Extract issue stats
    const issueStats = issueStatsResult.rows[0] || {
      total_issues: 0,
      completed_issues: 0,
      planned_by_today: 0
    };

    // Calculate rates
    const taskCompletionRate = taskStats.total_tasks > 0 
      ? (taskStats.completed_tasks / taskStats.total_tasks) * 100 
      : 0;
    
    const taskAchievementRate = taskStats.planned_by_today > 0 
      ? (taskStats.completed_tasks / taskStats.planned_by_today) * 100 
      : 0;

    const issueCompletionRate = issueStats.total_issues > 0 
      ? (issueStats.completed_issues / issueStats.total_issues) * 100 
      : 0;

    const issueAchievementRate = issueStats.planned_by_today > 0 
      ? (issueStats.completed_issues / issueStats.planned_by_today) * 100 
      : 0;

    return {
      cumulativePlannedCompletions: cumulativePlanned,
      cumulativeActualCompletions: cumulativeActual,
      todayPlannedTasks: Number(taskStats.today_planned),
      todayCompletedTasks: Number(taskStats.today_completed),
      totalTasks: Number(taskStats.total_tasks),
      taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
      taskAchievementRate: Math.round(taskAchievementRate * 100) / 100,
      issuesCreated: Number(issueStats.total_issues),
      issuesCompleted: Number(issueStats.completed_issues),
      totalIssues: Number(issueStats.total_issues),
      issueCompletionRate: Math.round(issueCompletionRate * 100) / 100,
      issueAchievementRate: Math.round(issueAchievementRate * 100) / 100,
      cumulativeIssuesCreated,
      cumulativeIssuesCompleted
    };
  }

  /**
   * Transform daily counts to cumulative counts
   */
  private static transformToCumulative(rows: Array<{ date: Date; count: string }>): Array<{ date: string; count: number }> {
    let cumulative = 0;
    return rows.map(row => {
      cumulative += Number(row.count);
      return {
        date: row.date.toISOString().split('T')[0],
        count: cumulative
      };
    });
  }
}
