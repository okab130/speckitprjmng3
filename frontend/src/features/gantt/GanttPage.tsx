import React, { useEffect, useMemo, useState } from 'react';
import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';
import { Card, Select, Spin, Input, Space, Button, Checkbox } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useTaskStore } from '../../store/taskStore';
import { useIssueStore } from '../../store/issueStore';
import { TaskStatus, Phase } from '../../types/task';
import { useFunctionStore } from '../../store/functionStore';
import { useUserStore } from '../../store/userStore';

const { Option } = Select;

/**
 * Safe date conversion utility
 * Converts string | Date | undefined to Date or null
 */
const toDate = (value: string | Date | undefined | null): Date | null => {
  if (!value) return null;
  
  // Already a Date object
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  
  // String conversion
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    
    const date = new Date(trimmed);
    return isNaN(date.getTime()) ? null : date;
  }
  
  return null;
};

/**
 * Check if a task has valid dates
 */
const hasValidDates = (task: any): boolean => {
  const start = toDate(task.startDate);
  const end = toDate(task.endDate);
  return start !== null && end !== null;
};

/**
 * Check if an issue has valid dates
 */
const hasValidIssueDates = (issue: any): boolean => {
  const start = toDate(issue.createdAt);
  const end = toDate(issue.dueDate);
  return start !== null && end !== null;
};

export const GanttPage: React.FC = () => {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const { issues, fetchIssues, loading: issuesLoading } = useIssueStore();
  const { functions, fetchFunctions } = useFunctionStore();
  const { users, fetchUsers } = useUserStore();
  const [viewMode, setViewMode] = React.useState<ViewMode>(ViewMode.Day);
  const [showIssues, setShowIssues] = useState(true);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined);
  const [phaseFilter, setPhaseFilter] = useState<Phase | undefined>(undefined);
  const [functionFilter, setFunctionFilter] = useState<string | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchTasks();
    fetchIssues();
    fetchFunctions();
    fetchUsers();
  }, [fetchTasks, fetchIssues, fetchFunctions, fetchUsers]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter(undefined);
    setPhaseFilter(undefined);
    setFunctionFilter(undefined);
    setAssigneeFilter(undefined);
  };

  const ganttTasks: GanttTask[] = useMemo(() => {
    const results: GanttTask[] = [];
    
    // Apply filters to tasks
    let filteredTasks = tasks.filter((task) => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = !statusFilter || task.status === statusFilter;
      const matchesPhase = !phaseFilter || task.phase === phaseFilter;
      const matchesFunction = !functionFilter || task.functionId === functionFilter;
      const matchesAssignee = !assigneeFilter || task.assigneeId === assigneeFilter;
      
      return matchesSearch && matchesStatus && matchesPhase && matchesFunction && matchesAssignee;
    });
    
    // Filter tasks with valid dates
    filteredTasks = filteredTasks.filter(hasValidDates);
    
    console.log(`%c=== Gantt Chart Data Processing ===`, 'color: #1890ff; font-weight: bold');
    console.log(`Total tasks: ${tasks.length}`);
    console.log(`Tasks with valid dates: ${filteredTasks.length}`);
    
    // Process tasks
    filteredTasks.forEach((task, index) => {
      const startDate = toDate(task.startDate);
      const endDate = toDate(task.endDate);
      
      if (!startDate || !endDate) {
        console.warn(`⚠️ Task "${task.title}" has invalid dates despite filter`);
        return;
      }
      
      const normalizedStatus = (task.status?.trim() || 'To Do') as TaskStatus;
      
      let backgroundColor: string;
      let backgroundSelectedColor: string;
      let progressColor: string;
      let progressSelectedColor: string;
      let progress: number;

      console.log(`\nTask ${index + 1}: "${task.title}"`);
      console.log(`  Status: "${task.status}" -> "${normalizedStatus}"`);
      console.log(`  Start: ${task.startDate} (${typeof task.startDate}) -> ${startDate.toISOString()}`);
      console.log(`  End: ${task.endDate} (${typeof task.endDate}) -> ${endDate.toISOString()}`);

      switch (normalizedStatus) {
        case 'Complete':
          backgroundColor = '#52c41a';
          backgroundSelectedColor = '#389e0d';
          progressColor = '#237804';
          progressSelectedColor = '#135200';
          progress = 100;
          console.log(`  ✅ Color: GREEN (Complete)`);
          break;
        case 'In Progress':
          backgroundColor = '#1890ff';
          backgroundSelectedColor = '#096dd9';
          progressColor = '#0050b3';
          progressSelectedColor = '#003a8c';
          progress = 50;
          console.log(`  🔵 Color: BLUE (In Progress)`);
          break;
        case 'To Do':
          backgroundColor = '#8c8c8c';
          backgroundSelectedColor = '#595959';
          progressColor = '#434343';
          progressSelectedColor = '#262626';
          progress = 0;
          console.log(`  ⚪ Color: GRAY (To Do)`);
          break;
        default:
          backgroundColor = '#8c8c8c';
          backgroundSelectedColor = '#595959';
          progressColor = '#434343';
          progressSelectedColor = '#262626';
          progress = 0;
          console.warn(`  ⚠️ Unknown status: "${normalizedStatus}", using default color`);
          break;
      }

      results.push({
        id: `task-${task.id}`,
        name: `[タスク] ${task.title}`,
        start: startDate,
        end: endDate,
        progress,
        type: 'task' as const,
        styles: {
          backgroundColor,
          backgroundSelectedColor,
          progressColor,
          progressSelectedColor,
        },
      });
    });

    // Process issues if enabled
    if (showIssues) {
      let filteredIssues = issues.filter((issue) => {
        const matchesSearch = !searchQuery || 
          issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (issue.description && issue.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesStatus = !statusFilter || issue.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      });
      
      // Filter issues with valid dates (createdAt - dueDate)
      filteredIssues = filteredIssues.filter(hasValidIssueDates);
      
      console.log(`Total issues: ${issues.length}`);
      console.log(`Issues with valid dates: ${filteredIssues.length}`);
      
      filteredIssues.forEach((issue, index) => {
        const startDate = toDate(issue.createdAt);
        const endDate = toDate(issue.dueDate);
        
        if (!startDate || !endDate) {
          console.warn(`⚠️ Issue "${issue.title}" has invalid dates despite filter`);
          return;
        }
        
        const normalizedStatus = (issue.status?.trim() || 'To Do') as TaskStatus;
        
        // Use orange/yellow colors for issues to distinguish from tasks
        let backgroundColor: string;
        let backgroundSelectedColor: string;
        let progressColor: string;
        let progressSelectedColor: string;
        let progress: number;

        console.log(`\nIssue ${index + 1}: "${issue.title}"`);
        console.log(`  Status: "${issue.status}" -> "${normalizedStatus}"`);
        console.log(`  Start: ${issue.createdAt} -> ${startDate.toISOString()}`);
        console.log(`  End: ${issue.dueDate} -> ${endDate.toISOString()}`);

        switch (normalizedStatus) {
          case 'Complete':
            backgroundColor = '#faad14'; // Orange
            backgroundSelectedColor = '#d48806';
            progressColor = '#ad6800';
            progressSelectedColor = '#874d00';
            progress = 100;
            console.log(`  🟠 Color: ORANGE (Complete Issue)`);
            break;
          case 'In Progress':
            backgroundColor = '#fa8c16'; // Dark Orange
            backgroundSelectedColor = '#d46b08';
            progressColor = '#ad4e00';
            progressSelectedColor = '#873800';
            progress = 50;
            console.log(`  🟠 Color: DARK ORANGE (In Progress Issue)`);
            break;
          case 'To Do':
            backgroundColor = '#ffd666'; // Light Orange
            backgroundSelectedColor = '#ffc53d';
            progressColor = '#faad14';
            progressSelectedColor = '#fa8c16';
            progress = 0;
            console.log(`  🟡 Color: YELLOW (To Do Issue)`);
            break;
          default:
            backgroundColor = '#ffd666';
            backgroundSelectedColor = '#ffc53d';
            progressColor = '#faad14';
            progressSelectedColor = '#fa8c16';
            progress = 0;
            console.warn(`  ⚠️ Unknown status: "${normalizedStatus}", using default color`);
            break;
        }

        results.push({
          id: `issue-${issue.id}`,
          name: `[課題] ${issue.title}`,
          start: startDate,
          end: endDate,
          progress,
          type: 'task' as const,
          styles: {
            backgroundColor,
            backgroundSelectedColor,
            progressColor,
            progressSelectedColor,
          },
        });
      });
    }

    return results;
  }, [tasks, issues, showIssues, searchQuery, statusFilter, phaseFilter, functionFilter, assigneeFilter]);

  if (isLoading || issuesLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (ganttTasks.length === 0) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>タスク・課題に日付を設定すると、ガントチャートに表示されます。</p>
          <p>タスクページ、課題ページで作成・編集してください。</p>
          {(tasks.length > 0 || issues.length > 0) && (
            <p style={{ color: '#ff4d4f', marginTop: '16px' }}>
              ※ {tasks.length} 件のタスク、{issues.length} 件の課題がありますが、有効な日付が設定されていません。
              ※ {tasks.length} 件のタスクがありますが、有効な日付が設定されていません。
            </p>
          )}
        </div>
      </Card>
    );
  }

  // Count items without valid dates
  const tasksWithoutDates = tasks.filter(t => !hasValidDates(t)).length;
  const issuesWithoutDates = issues.filter(i => !hasValidIssueDates(i)).length;

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h2 style={{ margin: 0 }}>Gantt Chart</h2>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 16, height: 16, backgroundColor: '#8c8c8c', borderRadius: 2 }}></div>
                <span>タスク To Do</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 16, height: 16, backgroundColor: '#1890ff', borderRadius: 2 }}></div>
                <span>タスク In Progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 16, height: 16, backgroundColor: '#52c41a', borderRadius: 2 }}></div>
                <span>タスク Complete</span>
              </div>
              <div style={{ width: 1, height: 20, backgroundColor: '#d9d9d9', margin: '0 8px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 16, height: 16, backgroundColor: '#ffd666', borderRadius: 2 }}></div>
                <span>課題 To Do</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 16, height: 16, backgroundColor: '#fa8c16', borderRadius: 2 }}></div>
                <span>課題 In Progress</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: 16, height: 16, backgroundColor: '#faad14', borderRadius: 2 }}></div>
                <span>課題 Complete</span>
              </div>
              <Checkbox checked={showIssues} onChange={(e) => setShowIssues(e.target.checked)} style={{ marginLeft: '8px' }}>
                課題を表示
              </Checkbox>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {(tasksWithoutDates > 0 || issuesWithoutDates > 0) && (
              <span style={{ fontSize: '12px', color: '#ff4d4f' }}>
                ⚠️ タスク{tasksWithoutDates}件、課題{issuesWithoutDates}件に日付未設定
              </span>
            )}
            <Select
              value={viewMode}
              onChange={setViewMode}
              style={{ width: 150 }}
            >
              <Option value={ViewMode.Hour}>Hour</Option>
              <Option value={ViewMode.QuarterDay}>Quarter Day</Option>
              <Option value={ViewMode.HalfDay}>Half Day</Option>
              <Option value={ViewMode.Day}>Day</Option>
              <Option value={ViewMode.Week}>Week</Option>
              <Option value={ViewMode.Month}>Month</Option>
            </Select>
          </div>
        </div>
        
        {/* Filters */}
        <Space size="middle" wrap>
          <Input
            placeholder="Search tasks..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="ステータス"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="To Do">To Do</Option>
            <Option value="In Progress">In Progress</Option>
            <Option value="Complete">Complete</Option>
          </Select>
          <Select
            placeholder="工程区分"
            value={phaseFilter}
            onChange={setPhaseFilter}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="要件定義">要件定義</Option>
            <Option value="設計">設計</Option>
            <Option value="製造">製造</Option>
            <Option value="テスト">テスト</Option>
            <Option value="本番移行">本番移行</Option>
          </Select>
          <Select
            placeholder="機能"
            value={functionFilter}
            onChange={setFunctionFilter}
            style={{ width: 250 }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {functions.map((func) => (
              <Option key={func.id} value={func.id}>
                {func.system_name} - {func.function_name}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="担当者"
            value={assigneeFilter}
            onChange={setAssigneeFilter}
            style={{ width: 150 }}
            allowClear
            showSearch
            optionFilterProp="children"
          >
            {users.map((user) => (
              <Option key={user.id} value={user.id}>
                {user.name}
              </Option>
            ))}
          </Select>
          <Button onClick={handleClearFilters}>
            フィルタをクリア
          </Button>
        </Space>
      </Card>
      <Card>
        <Gantt
          tasks={ganttTasks}
          viewMode={viewMode}
          locale="ja"
          listCellWidth=""
          columnWidth={viewMode === ViewMode.Month ? 300 : viewMode === ViewMode.Week ? 200 : 65}
          rowHeight={50}
          barBackgroundColor="#f0f0f0"
          barBackgroundSelectedColor="#e0e0e0"
          barProgressColor="#transparent"
          barProgressSelectedColor="#transparent"
        />
      </Card>
    </div>
  );
};
