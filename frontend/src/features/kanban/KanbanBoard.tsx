import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { message, Space, Typography, Input, Select, Button, Card, Checkbox } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { TaskWithCreator, TaskStatus, UpdateTaskInput, Phase } from '../../types/task';
import { Issue } from '../../types/issue';
import { useTaskStore } from '../../store/taskStore';
import { useIssueStore } from '../../store/issueStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { KanbanColumn } from '../../components/kanban/KanbanColumn';
import { TaskDetail } from '../tasks/TaskDetail';
import { IssueDetail } from '../issues/IssueDetail';
import { useFunctionStore } from '../../store/functionStore';
import { useUserStore } from '../../store/userStore';
import { useProjectStore } from '../../store/projectStore';
import { ProjectSelector } from '../projects/ProjectSelector';

const { Title } = Typography;
const { Option } = Select;

type KanbanItem = (TaskWithCreator & { itemType: 'task' }) | (Issue & { itemType: 'issue' });

/**
 * KanbanBoard Component
 * 
 * Main Kanban board view with drag-and-drop task management.
 * Implements User Story 2: Visualize Work with Kanban Board
 * 
 * Features:
 * - Three columns: To Do, In Progress, Complete
 * - Drag and drop tasks between columns
 * - Real-time updates via WebSocket
 * - Optimistic UI updates with rollback on error
 * - Click tasks to view/edit details
 */
export const KanbanBoard: React.FC = () => {
  const {
    tasks,
    error,
    fetchTasksGroupedByStatus,
    updateTask,
    updateTaskStatus,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
    setSelectedTask,
    selectedTask,
  } = useTaskStore();

  const { 
    issues, 
    fetchIssues,
    handleIssueCreated,
    handleIssueUpdated,
    handleIssueDeleted,
  } = useIssueStore();

  const { functions, fetchFunctions } = useFunctionStore();
  const { users, fetchUsers } = useUserStore();
  const { currentProjectId, setCurrentProjectId } = useProjectStore();

  const [groupedTasks, setGroupedTasks] = useState<Record<TaskStatus, TaskWithCreator[]>>({
    'To Do': [],
    'In Progress': [],
    'Complete': [],
  });
  const [groupedIssues, setGroupedIssues] = useState<Record<TaskStatus, Issue[]>>({
    'To Do': [],
    'In Progress': [],
    'Complete': [],
  });
  const [groupedItems, setGroupedItems] = useState<Record<TaskStatus, KanbanItem[]>>({
    'To Do': [],
    'In Progress': [],
    'Complete': [],
  });
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isIssueDetailVisible, setIsIssueDetailVisible] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [phaseFilter, setPhaseFilter] = useState<Phase | undefined>(undefined);
  const [functionFilter, setFunctionFilter] = useState<string | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(undefined);

  // Load tasks and issues on mount and when project changes
  useEffect(() => {
    loadTasks();
    loadIssues();
    fetchFunctions();
    fetchUsers();
  }, [currentProjectId]); // Reload when project changes

  const loadTasks = async () => {
    try {
      const grouped = await fetchTasksGroupedByStatus();
      setGroupedTasks(grouped as Record<TaskStatus, TaskWithCreator[]>);
    } catch (err) {
      message.error('Failed to load tasks');
    }
  };

  const loadIssues = async () => {
    try {
      await fetchIssues();
    } catch (err) {
      message.error('Failed to load issues');
    }
  };

  // Update grouped tasks when tasks state changes
  useEffect(() => {
    const grouped: Record<TaskStatus, TaskWithCreator[]> = {
      'To Do': [],
      'In Progress': [],
      'Complete': [],
    };

    // Apply filters and group tasks by status
    (tasks as TaskWithCreator[])
      .filter((task) => {
        const matchesSearch = !searchQuery || 
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
        
        const matchesPhase = !phaseFilter || task.phase === phaseFilter;
        const matchesFunction = !functionFilter || task.functionId === functionFilter;
        const matchesAssignee = !assigneeFilter || task.assigneeId === assigneeFilter;
        const matchesProject = !currentProjectId || task.projectId === currentProjectId;
        
        return matchesSearch && matchesPhase && matchesFunction && matchesAssignee && matchesProject;
      })
      .forEach((task) => {
        if (grouped[task.status]) {
          grouped[task.status].push(task);
        }
      });

    // Sort by creation date (oldest first for better visualization)
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    setGroupedTasks(grouped);
  }, [tasks, searchQuery, phaseFilter, functionFilter, assigneeFilter, currentProjectId]);

  // Update grouped issues when issues state changes
  useEffect(() => {
    console.log('[KanbanBoard] Issues state changed, count:', issues.length);
    const grouped: Record<TaskStatus, Issue[]> = {
      'To Do': [],
      'In Progress': [],
      'Complete': [],
    };

    // Apply filters and group issues by status
    issues
      .filter((issue) => {
        const matchesSearch = !searchQuery || 
          issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          issue.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch;
      })
      .forEach((issue) => {
        if (grouped[issue.status]) {
          grouped[issue.status].push(issue);
        }
      });

    // Sort by creation date
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    console.log('[KanbanBoard] Grouped issues:', { 
      'To Do': grouped['To Do'].length, 
      'In Progress': grouped['In Progress'].length, 
      'Complete': grouped['Complete'].length 
    });

    setGroupedIssues(grouped);
  }, [issues, searchQuery]);

  // Combine tasks and issues into unified kanban items
  useEffect(() => {
    console.log('[KanbanBoard] Combining tasks and issues');
    console.log('[KanbanBoard] GroupedTasks:', {
      'To Do': groupedTasks['To Do'].length,
      'In Progress': groupedTasks['In Progress'].length,
      'Complete': groupedTasks['Complete'].length
    });
    console.log('[KanbanBoard] GroupedIssues:', {
      'To Do': groupedIssues['To Do'].length,
      'In Progress': groupedIssues['In Progress'].length,
      'Complete': groupedIssues['Complete'].length
    });

    const combined: Record<TaskStatus, KanbanItem[]> = {
      'To Do': [],
      'In Progress': [],
      'Complete': [],
    };

    // Add tasks with itemType
    Object.keys(groupedTasks).forEach((status) => {
      combined[status as TaskStatus] = [
        ...groupedTasks[status as TaskStatus].map(task => ({ ...task, itemType: 'task' as const })),
      ];
    });

    // Add issues with itemType
    Object.keys(groupedIssues).forEach((status) => {
      combined[status as TaskStatus] = [
        ...combined[status as TaskStatus],
        ...groupedIssues[status as TaskStatus].map(issue => ({ ...issue, itemType: 'issue' as const })),
      ];
    });

    // Sort combined items by creation date
    Object.keys(combined).forEach((status) => {
      combined[status as TaskStatus].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    console.log('[KanbanBoard] Combined items:', {
      'To Do': combined['To Do'].length,
      'In Progress': combined['In Progress'].length,
      'Complete': combined['Complete'].length
    });

    setGroupedItems(combined);
  }, [groupedTasks, groupedIssues]);

  // WebSocket real-time updates for tasks
  useWebSocket('task:created', (event: any) => {
    console.log('[WebSocket] Received task:created', event);
    const task = event.payload as TaskWithCreator;
    handleTaskCreated(task);
    message.success(`New task created: ${task.title}`);
  });

  useWebSocket('task:updated', (event: any) => {
    console.log('[WebSocket] Received task:updated', event);
    const task = event.payload as TaskWithCreator;
    handleTaskUpdated(task);
  });

  useWebSocket('task:deleted', (event: any) => {
    console.log('[WebSocket] Received task:deleted', event);
    const data = event.payload as { id: string };
    handleTaskDeleted(data.id);
    message.info('Task deleted');
  });

  // WebSocket real-time updates for issues
  useWebSocket('issue:created', (event: any) => {
    console.log('[WebSocket] Received issue:created', event);
    const issue = event.payload as Issue;
    handleIssueCreated(issue);
    message.success(`New issue created: ${issue.title}`);
  });

  useWebSocket('issue:updated', (event: any) => {
    console.log('[WebSocket] Received issue:updated', event);
    const issue = event.payload as Issue;
    handleIssueUpdated(issue);
  });

  useWebSocket('issue:deleted', (event: any) => {
    console.log('[WebSocket] Received issue:deleted', event);
    const data = event.payload as { id: string };
    handleIssueDeleted(data);
    message.info('Issue deleted');
  });

  // Handle drag and drop
  const handleDragEnd = useCallback(
    async (result: DropResult) => {
      const { source, destination, draggableId } = result;

      // Dropped outside any droppable area
      if (!destination) {
        return;
      }

      // Dropped in the same position
      if (
        source.droppableId === destination.droppableId &&
        source.index === destination.index
      ) {
        return;
      }

      const sourceStatus = source.droppableId as TaskStatus;
      const destStatus = destination.droppableId as TaskStatus;

      // If dropped in a different column, update status
      if (sourceStatus !== destStatus) {
        const task = tasks.find((t) => t.id === draggableId);
        const issue = issues.find((i) => i.id === draggableId);
        
        if (task) {
          try {
            // Update task status with optimistic UI
            await updateTaskStatus(task.id, destStatus, task.version);
            message.success(`Task moved to ${destStatus}`);
          } catch (err: any) {
            message.error(err.response?.data?.error || 'Failed to update task status');
            // Tasks will be rolled back by the store
          }
        } else if (issue) {
          try {
            // Update issue status
            await useIssueStore.getState().updateIssue(issue.id, { status: destStatus });
            message.success(`Issue moved to ${destStatus}`);
          } catch (err: any) {
            message.error(err.response?.data?.error || 'Failed to update issue status');
          }
        } else {
          message.error('Item not found');
        }
      }
    },
    [tasks, issues, updateTaskStatus]
  );

  // Handle item card click
  const handleItemClick = useCallback(
    (item: KanbanItem) => {
      if (item.itemType === 'task') {
        setSelectedTask(item as TaskWithCreator);
        setIsDetailModalVisible(true);
      } else {
        // Open issue detail modal
        setSelectedIssueId(item.id);
        setIsIssueDetailVisible(true);
      }
    },
    [setSelectedTask]
  );

  // Handle task detail modal close
  const handleDetailClose = useCallback(() => {
    setIsDetailModalVisible(false);
    setSelectedTask(null);
  }, [setSelectedTask]);

  // Handle issue detail modal close
  const handleIssueDetailClose = useCallback(() => {
    setIsIssueDetailVisible(false);
    setSelectedIssueId(null);
  }, []);

  // Handle task update from detail modal
  const handleTaskUpdate = useCallback(async (id: string, data: UpdateTaskInput) => {
    try {
      await updateTask(id, data);
      message.success('Task updated successfully');
      loadTasks();
    } catch (err) {
      message.error('Failed to update task');
    }
  }, []);

  const handleClearFilters = () => {
    setSearchQuery('');
    setPhaseFilter(undefined);
    setFunctionFilter(undefined);
    setAssigneeFilter(undefined);
  };

  // Show error message
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  return (
    <div style={{ padding: '24px', height: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            Kanban Board
          </Title>
        </div>
        
        {/* Color Legend */}
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', alignItems: 'center' }}>
          <span style={{ fontWeight: 500, marginRight: '8px' }}>色分け:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#ffffff', border: '1px solid #d9d9d9', borderRadius: 2 }}></div>
            <span>タスク</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#fffbe6', border: '1px solid #ffd666', borderRadius: 2 }}></div>
            <span>課題 To Do</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#fff1e6', border: '1px solid #fa8c16', borderRadius: 2 }}></div>
            <span>課題 In Progress</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: 16, height: 16, backgroundColor: '#fff7e6', border: '1px solid #faad14', borderRadius: 2 }}></div>
            <span>課題 Complete</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <ProjectSelector
            value={currentProjectId}
            onChange={setCurrentProjectId}
            style={{ width: 200 }}
          />
          <Input
            placeholder="Search tasks..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
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

      {/* Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Space
          size={16}
          style={{
            width: '100%',
            alignItems: 'stretch',
            display: 'flex',
          }}
        >
          <KanbanColumn
            status="To Do"
            tasks={groupedItems['To Do']}
            onTaskClick={handleItemClick}
          />
          <KanbanColumn
            status="In Progress"
            tasks={groupedItems['In Progress']}
            onTaskClick={handleItemClick}
          />
          <KanbanColumn
            status="Complete"
            tasks={groupedItems['Complete']}
            onTaskClick={handleItemClick}
          />
        </Space>
      </DragDropContext>

      {/* Task Detail Modal */}
      <TaskDetail
        task={selectedTask}
        open={isDetailModalVisible}
        onClose={handleDetailClose}
        onUpdate={handleTaskUpdate}
      />

      {/* Issue Detail Modal */}
      {selectedIssueId && (
        <IssueDetail
          issueId={selectedIssueId}
          visible={isIssueDetailVisible}
          onClose={handleIssueDetailClose}
        />
      )}
    </div>
  );
};
