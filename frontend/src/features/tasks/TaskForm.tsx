import React, { useState, useEffect } from 'react';
import { Form, Input, Select, DatePicker, Button, Space, message } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus, Phase } from '../../types/task';
import { useFunctionStore } from '../../store/functionStore';
import { useUserStore } from '../../store/userStore';

const { TextArea } = Input;
const { Option } = Select;

interface TaskFormProps {
  task?: Task | null; // If provided, form is in edit mode
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const statusOptions: TaskStatus[] = ['To Do', 'In Progress', 'Complete'];
const phaseOptions: Phase[] = ['要件定義', '設計', '製造', 'テスト', '本番移行'];

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { functions, fetchFunctions } = useFunctionStore();
  const { users, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchFunctions();
    fetchUsers();
  }, [fetchFunctions, fetchUsers]);

  // Populate form with task data in edit mode
  useEffect(() => {
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description || '',
        status: task.status,
        phase: task.phase,
        functionId: task.functionId,
        assigneeId: task.assigneeId,
        dateRange: task.startDate && task.endDate
          ? [dayjs(task.startDate), dayjs(task.endDate)]
          : undefined,
      });
    } else {
      form.resetFields();
    }
  }, [task, form]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const [startDate, endDate] = values.dateRange || [null, null];

      const taskData: CreateTaskInput | UpdateTaskInput = {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        status: values.status || 'To Do',
        startDate: startDate ? startDate.format('YYYY-MM-DD') : undefined,
        endDate: endDate ? endDate.format('YYYY-MM-DD') : undefined,
        phase: values.phase || undefined,
        functionId: values.functionId || undefined,
        assigneeId: values.assigneeId || undefined,
        ...(task && { version: task.version }), // Include version for updates
      };

      await onSubmit(taskData);
      
      message.success(task ? 'Task updated successfully' : 'Task created successfully');
      
      if (!task) {
        form.resetFields();
      }
    } catch (error: any) {
      console.error('Task form submission error:', error);
      
      // Handle optimistic locking conflict
      if (error.response?.status === 409) {
        message.error('Task was modified by another user. Please refresh and try again.');
      } else {
        message.error(error.response?.data?.error || 'Failed to save task');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateDateRange = (_: any, value: [Dayjs, Dayjs] | undefined) => {
    if (!value) {
      return Promise.resolve();
    }

    const [start, end] = value;
    if (start && end && start.isAfter(end)) {
      return Promise.reject(new Error('Start date must be before or equal to end date'));
    }

    return Promise.resolve();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ status: 'To Do' }}
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[
          { required: true, message: 'Please enter a task title' },
          { max: 255, message: 'Title must be less than 255 characters' },
        ]}
      >
        <Input placeholder="Enter task title" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
      >
        <TextArea
          rows={4}
          placeholder="Enter task description (optional)"
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        rules={[{ required: true, message: 'Please select a status' }]}
      >
        <Select placeholder="Select status">
          {statusOptions.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="phase"
        label="工程区分"
      >
        <Select placeholder="工程を選択（任意）" allowClear>
          {phaseOptions.map((phase) => (
            <Option key={phase} value={phase}>
              {phase}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="functionId"
        label="機能"
      >
        <Select
          placeholder="機能を選択（任意）"
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {functions.map((func) => (
            <Option key={func.id} value={func.id}>
              {func.system_name} - {func.function_name} - {func.function_detail}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="assigneeId"
        label="担当者"
      >
        <Select
          placeholder="担当者を選択（任意）"
          allowClear
          showSearch
          optionFilterProp="children"
        >
          {users.map((user) => (
            <Option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="dateRange"
        label="Date Range"
        rules={[{ validator: validateDateRange }]}
      >
        <DatePicker.RangePicker
          format="YYYY-MM-DD"
          style={{ width: '100%' }}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting || loading}
          >
            {task ? 'Update Task' : 'Create Task'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} disabled={isSubmitting || loading}>
              Cancel
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};
