import React, { useState } from 'react';
import { Table, Tag, Button, Space, Popconfirm, Typography, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { Task, TaskStatus } from '../../types/task';

const { Text } = Typography;

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onView: (task: Task) => void;
  onDuplicate?: (task: Task) => void;
}

// Status badge colors
const statusColors: Record<TaskStatus, string> = {
  'To Do': 'default',
  'In Progress': 'processing',
  'Complete': 'success',
};

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading = false,
  onEdit,
  onDelete,
  onView,
  onDuplicate,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (taskId: string) => {
    setDeletingId(taskId);
    try {
      await onDelete(taskId);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnsType<Task> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '30%',
      ellipsis: {
        showTitle: false,
      },
      render: (title: string, record: Task) => (
        <Tooltip title={title}>
          <Button
            type="link"
            onClick={() => onView(record)}
            style={{ padding: 0, height: 'auto' }}
          >
            {title}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      ellipsis: {
        showTitle: false,
      },
      render: (description?: string) => (
        <Tooltip title={description || 'No description'}>
          <Text type="secondary" ellipsis>
            {description || 'No description'}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: '12%',
      render: (status: TaskStatus) => (
        <Tag color={statusColors[status]}>{status}</Tag>
      ),
      filters: [
        { text: 'To Do', value: 'To Do' },
        { text: 'In Progress', value: 'In Progress' },
        { text: 'Complete', value: 'Complete' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Creator',
      dataIndex: 'creatorName',
      key: 'creatorName',
      width: '12%',
      ellipsis: {
        showTitle: false,
      },
      render: (name?: string) => (
        <Tooltip title={name || 'Unknown'}>
          <Text ellipsis>{name || 'Unknown'}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Date Range',
      key: 'dateRange',
      width: '15%',
      render: (_, record: Task) => {
        if (record.startDate && record.endDate) {
          return (
            <Text type="secondary">
              {dayjs(record.startDate).format('MMM DD')} - {dayjs(record.endDate).format('MMM DD, YYYY')}
            </Text>
          );
        }
        return <Text type="secondary">No dates set</Text>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '12%',
      render: (_, record: Task) => (
        <Space size="small">
          <Tooltip title="View details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit task">
            <Button
              icon={<EditOutlined />}
              size="small"
              type="primary"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          {onDuplicate && (
            <Tooltip title="Duplicate task">
              <Button
                icon={<CopyOutlined />}
                size="small"
                onClick={() => onDuplicate(record)}
              />
            </Tooltip>
          )}
          <Tooltip title="Delete task">
            <Popconfirm
              title="Are you sure you want to delete this task?"
              description="This action cannot be undone."
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                loading={deletingId === record.id}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table<Task>
      columns={columns}
      dataSource={tasks}
      loading={loading}
      rowKey="id"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tasks`,
      }}
      scroll={{ x: 1000 }}
    />
  );
};
