import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, Tabs } from 'antd';
import { dashboardApi } from '@/lib/dashboardApi';
import { DashboardStats } from '@/types/dashboard';
import { StatsCard } from './StatsCard';
import { ProgressCard } from './ProgressCard';
import { DonutChart } from './DonutChart';
import { CumulativeChart } from './CumulativeChart';
import { ComparisonChart } from './ComparisonChart';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProjectStore } from '@/store/projectStore';

const { TabPane } = Tabs;

type DateRange = 'today' | 'week' | 'month';

export function DashboardPage() {
  const { currentProjectId, setCurrentProjectId, projects, fetchProjects } = useProjectStore();
  const [dateRange, setDateRange] = useState<DateRange>('today');
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats', currentProjectId],
    queryFn: () => dashboardApi.getStats(currentProjectId || undefined),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            ダッシュボードデータの読み込みに失敗しました。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate task status distribution
  const taskStatusData = [
    { name: 'To Do', value: stats.totalTasks - stats.todayCompletedTasks - Math.floor(stats.totalTasks * 0.3) },
    { name: 'In Progress', value: Math.floor(stats.totalTasks * 0.3) },
    { name: 'Complete', value: stats.todayCompletedTasks },
  ];

  // Mock comparison data (you can replace with real API data)
  const comparisonData = [
    { name: '月', current: stats.todayCompletedTasks, previous: Math.floor(stats.todayCompletedTasks * 0.8) },
    { name: '火', current: stats.todayCompletedTasks + 2, previous: stats.todayCompletedTasks },
    { name: '水', current: stats.todayCompletedTasks + 3, previous: stats.todayCompletedTasks - 1 },
    { name: '木', current: stats.todayCompletedTasks + 1, previous: stats.todayCompletedTasks + 2 },
    { name: '金', current: stats.todayCompletedTasks + 4, previous: stats.todayCompletedTasks + 1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              ダッシュボード
            </h1>
            <p className="text-gray-600 mt-2">📊 プロジェクトの進捗状況を一目で確認</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">期間:</span>
              <Select
                value={dateRange}
                onChange={(value) => setDateRange(value as DateRange)}
                style={{ width: 120 }}
                options={[
                  { label: '本日', value: 'today' },
                  { label: '今週', value: 'week' },
                  { label: '今月', value: 'month' },
                ]}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">プロジェクト:</span>
              <Select
                style={{ width: 250 }}
                placeholder="全プロジェクト"
                allowClear
                value={currentProjectId}
                onChange={(value) => setCurrentProjectId(value || null)}
                options={[
                  { label: '全プロジェクト', value: null },
                  ...projects.map((p) => ({ label: p.name, value: p.id })),
                ]}
              />
            </div>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" size="large">
          <TabPane tab="📈 概要" key="overview">
            <div className="space-y-6">
              {/* Top KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatsCard
                  title="本日完了予定"
                  value={stats.todayPlannedTasks}
                  description="本日完了予定のタスク数"
                  icon="📅"
                  colorScheme="blue"
                />
                <StatsCard
                  title="本日完了実績"
                  value={stats.todayCompletedTasks}
                  description="本日完了したタスク数"
                  icon="✅"
                  colorScheme="green"
                  trend="up"
                  trendValue="+12%"
                />
                <StatsCard
                  title="全タスク数"
                  value={stats.totalTasks}
                  description="すべてのタスク"
                  icon="📝"
                  colorScheme="purple"
                />
                <StatsCard
                  title="完了率"
                  value={`${stats.taskCompletionRate.toFixed(1)}%`}
                  description="完了実績 / 全タスク数"
                  icon="📈"
                  colorScheme={stats.taskCompletionRate >= 80 ? 'green' : stats.taskCompletionRate >= 50 ? 'yellow' : 'red'}
                  trend={stats.taskCompletionRate >= 50 ? 'up' : 'down'}
                  trendValue={`${stats.taskCompletionRate.toFixed(0)}%`}
                />
                <StatsCard
                  title="達成率"
                  value={`${stats.taskAchievementRate.toFixed(1)}%`}
                  description="完了実績 / 完了予定数"
                  icon="🎯"
                  colorScheme={stats.taskAchievementRate >= 80 ? 'green' : stats.taskAchievementRate >= 50 ? 'yellow' : 'red'}
                  trend={stats.taskAchievementRate >= 50 ? 'up' : 'down'}
                  trendValue={`${stats.taskAchievementRate.toFixed(0)}%`}
                />
              </div>

              {/* 3 Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Progress Cards */}
                <div className="space-y-4">
                  <ProgressCard
                    title="タスク進捗"
                    current={stats.todayCompletedTasks}
                    total={stats.totalTasks}
                    icon="📊"
                    colorScheme="blue"
                  />
                  <ProgressCard
                    title="課題解決"
                    current={stats.issuesCompleted}
                    total={stats.issuesCreated}
                    icon="⚠️"
                    colorScheme="yellow"
                  />
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
                    <h3 className="text-lg font-semibold mb-2">🔔 重要通知</h3>
                    <p className="text-sm opacity-90">
                      本日期限のタスクが {stats.todayPlannedTasks} 件あります
                    </p>
                  </div>
                </div>

                {/* Center: Charts */}
                <div className="lg:col-span-2 space-y-4">
                  <DonutChart
                    title="タスクステータス分布"
                    data={taskStatusData}
                    colors={['#94a3b8', '#3b82f6', '#22c55e']}
                    icon="🎯"
                  />
                  <ComparisonChart
                    title="週次完了タスク比較"
                    data={comparisonData}
                    currentLabel="今週"
                    previousLabel="先週"
                  />
                </div>
              </div>

              {/* Cumulative Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CumulativeChart
                  title="タスク累積グラフ"
                  plannedData={stats.cumulativePlannedCompletions}
                  actualData={stats.cumulativeActualCompletions}
                  plannedLabel="累積完了予定"
                  actualLabel="累積完了実績"
                />
                <CumulativeChart
                  title="課題累積グラフ"
                  plannedData={stats.cumulativeIssuesCreated}
                  actualData={stats.cumulativeIssuesCompleted}
                  plannedLabel="累積発生数"
                  actualLabel="累積完了数"
                />
              </div>
            </div>
          </TabPane>

          <TabPane tab="📋 タスク詳細" key="tasks">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">📊</span>
                  <h2 className="text-2xl font-bold text-gray-800">タスク統計</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatsCard
                    title="本日完了予定"
                    value={stats.todayPlannedTasks}
                    description="本日完了予定のタスク数"
                    icon="📅"
                    colorScheme="blue"
                  />
                  <StatsCard
                    title="本日完了実績"
                    value={stats.todayCompletedTasks}
                    description="本日完了したタスク数"
                    icon="✅"
                    colorScheme="green"
                  />
                  <StatsCard
                    title="全タスク数"
                    value={stats.totalTasks}
                    description="すべてのタスク"
                    icon="📝"
                    colorScheme="purple"
                  />
                  <StatsCard
                    title="完了率"
                    value={`${stats.taskCompletionRate.toFixed(1)}%`}
                    description="完了実績 / 全タスク数"
                    icon="📈"
                    colorScheme={stats.taskCompletionRate >= 80 ? 'green' : stats.taskCompletionRate >= 50 ? 'yellow' : 'red'}
                  />
                  <StatsCard
                    title="達成率"
                    value={`${stats.taskAchievementRate.toFixed(1)}%`}
                    description="完了実績 / 完了予定数"
                    icon="🎯"
                    colorScheme={stats.taskAchievementRate >= 80 ? 'green' : stats.taskAchievementRate >= 50 ? 'yellow' : 'red'}
                  />
                </div>
              </div>
              <CumulativeChart
                title="タスク累積グラフ"
                plannedData={stats.cumulativePlannedCompletions}
                actualData={stats.cumulativeActualCompletions}
                plannedLabel="累積完了予定"
                actualLabel="累積完了実績"
              />
            </div>
          </TabPane>

          <TabPane tab="⚠️ 課題詳細" key="issues">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">⚠️</span>
                  <h2 className="text-2xl font-bold text-gray-800">課題統計</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    title="課題発生数"
                    value={stats.issuesCreated}
                    description="すべての課題"
                    icon="🔔"
                    colorScheme="yellow"
                  />
                  <StatsCard
                    title="課題完了数"
                    value={stats.issuesCompleted}
                    description="完了した課題"
                    icon="✔️"
                    colorScheme="green"
                  />
                  <StatsCard
                    title="課題完了率"
                    value={`${stats.issueCompletionRate.toFixed(1)}%`}
                    description="完了実績 / 全課題数"
                    icon="📊"
                    colorScheme={stats.issueCompletionRate >= 80 ? 'green' : stats.issueCompletionRate >= 50 ? 'yellow' : 'red'}
                  />
                  <StatsCard
                    title="課題達成率"
                    value={`${stats.issueAchievementRate.toFixed(1)}%`}
                    description="完了実績 / 期限内課題数"
                    icon="🎯"
                    colorScheme={stats.issueAchievementRate >= 80 ? 'green' : stats.issueAchievementRate >= 50 ? 'yellow' : 'red'}
                  />
                </div>
              </div>
              <CumulativeChart
                title="課題累積グラフ"
                plannedData={stats.cumulativeIssuesCreated}
                actualData={stats.cumulativeIssuesCompleted}
                plannedLabel="累積発生数"
                actualLabel="累積完了数"
              />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
