import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Drawer, Input, Select, Alert } from 'antd';
import { PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { useTasks } from '../../hooks/useTasks';
import { TaskList } from './TaskList';
import { TaskForm } from './TaskForm';
import { TaskDetail } from './TaskDetail';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, Phase } from '../../types/task';
import { useFunctionStore } from '../../store/functionStore';
import { useUserStore } from '../../store/userStore';

const { Title } = Typography;
const { Option } = Select;

export const TasksPage: React.FC = () => {
  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch,
    clearError,
  } = useTasks(true);

  const { functions, fetchFunctions } = useFunctionStore();
  const { users, fetchUsers } = useUserStore();

  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>(undefined);
  const [phaseFilter, setPhaseFilter] = useState<Phase | undefined>(undefined);
  const [functionFilter, setFunctionFilter] = useState<string | undefined>(undefined);
  const [assigneeFilter, setAssigneeFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchFunctions();
    fetchUsers();
  }, [fetchFunctions, fetchUsers]);

  const handleCreate = async (data: CreateTaskInput) => {
    await createTask(data);
    setIsCreateDrawerOpen(false);
  };

  const handleUpdate = async (id: string, data: UpdateTaskInput) => {
    await updateTask(id, data);
    setEditingTask(null);
  };

  const handleDelete = async (id: string) => {
    await deleteTask(id);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  const handleView = (task: Task) => {
    setViewingTask(task);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Apply filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = !statusFilter || task.status === statusFilter;
    const matchesPhase = !phaseFilter || task.phase === phaseFilter;
    const matchesFunction = !functionFilter || task.functionId === functionFilter;
    const matchesAssignee = !assigneeFilter || task.assigneeId === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesPhase && matchesFunction && matchesAssignee;
  });

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter(undefined);
    setPhaseFilter(undefined);
    setFunctionFilter(undefined);
    setAssigneeFilter(undefined);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level={2} style={{ margin: 0 }}>
              Tasks
            </Title>
            <Space>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={isLoading}
              >
                Refresh
              </Button>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsCreateDrawerOpen(true)}
              >
                Create Task
              </Button>
            </Space>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              closable
              onClose={clearError}
            />
          )}

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

          {/* Task List */}
          <TaskList
            tasks={filteredTasks}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
          />
        </Space>
      </Card>

      {/* Create Task Drawer */}
      <Drawer
        title="Create New Task"
        placement="right"
        width={600}
        open={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
        destroyOnClose
      >
        <TaskForm
          onSubmit={handleCreate as any}
          onCancel={() => setIsCreateDrawerOpen(false)}
        />
      </Drawer>

      {/* Edit Task Drawer */}
      <Drawer
        title="Edit Task"
        placement="right"
        width={600}
        open={!!editingTask}
        onClose={() => setEditingTask(null)}
        destroyOnClose
      >
        <TaskForm
          task={editingTask}
          onSubmit={(data) => handleUpdate(editingTask!.id, data as UpdateTaskInput)}
          onCancel={() => setEditingTask(null)}
        />
      </Drawer>

      {/* View Task Detail Modal */}
      <TaskDetail
        task={viewingTask}
        open={!!viewingTask}
        onClose={() => setViewingTask(null)}
        onUpdate={handleUpdate}
      />
    </div>
  );
};
