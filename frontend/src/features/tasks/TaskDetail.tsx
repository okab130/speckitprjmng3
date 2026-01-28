import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Button, Space, Typography, Divider, Select, List, Popconfirm, message } from 'antd';
import { EditOutlined, CloseOutlined, LinkOutlined, DisconnectOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '../../types/task';
import { Issue } from '../../types/issue';
import { TaskForm } from './TaskForm';
import { useIssues } from '../../hooks/useIssues';

const { Text, Title } = Typography;
const { Option } = Select;

interface TaskDetailProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: UpdateTaskInput) => Promise<void>;
  loading?: boolean;
}

const statusColors: Record<TaskStatus, string> = {
  'To Do': 'default',
  'In Progress': 'processing',
  'Complete': 'success',
};

export const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  open,
  onClose,
  onUpdate,
  loading = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const { issues, fetchIssues, linkIssueToTask, unlinkIssueFromTask, fetchIssuesForTask } = useIssues();
  const [linkedIssues, setLinkedIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | undefined>(undefined);
  const [linkingIssue, setLinkingIssue] = useState(false);

  useEffect(() => {
    if (open && task) {
      loadLinkedIssues();
      fetchIssues();
    }
  }, [open, task]);

  const loadLinkedIssues = async () => {
    if (!task) return;
    try {
      const issues = await fetchIssuesForTask(task.id);
      setLinkedIssues(issues);
    } catch (error) {
      console.error('Failed to load linked issues:', error);
    }
  };

  const handleLinkIssue = async () => {
    if (!task || !selectedIssueId) return;
    
    setLinkingIssue(true);
    try {
      await linkIssueToTask(task.id, selectedIssueId);
      message.success('Issue linked successfully');
      setSelectedIssueId(undefined);
      await loadLinkedIssues();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to link issue');
    } finally {
      setLinkingIssue(false);
    }
  };

  const handleUnlinkIssue = async (issueId: string) => {
    if (!task) return;
    
    try {
      await unlinkIssueFromTask(task.id, issueId);
      message.success('Issue unlinked successfully');
      await loadLinkedIssues();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to unlink issue');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'red';
      case 'Resolved':
        return 'green';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High':
        return 'red';
      case 'Medium':
        return 'orange';
      case 'Low':
        return 'blue';
      default:
        return 'default';
    }
  };

  // Filter out already linked issues
  const availableIssues = issues.filter(
    (issue) => !linkedIssues.some((linked) => linked.id === issue.id)
  );

  if (!task) {
    return null;
  }

  const handleUpdate = async (data: CreateTaskInput | UpdateTaskInput) => {
    await onUpdate(task.id, data as UpdateTaskInput);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleModalClose = () => {
    setIsEditing(false);
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <Title level={4} style={{ margin: 0 }}>
            {isEditing ? 'Edit Task' : 'Task Details'}
          </Title>
          <Tag color={statusColors[task.status]}>{task.status}</Tag>
        </Space>
      }
      open={open}
      onCancel={handleModalClose}
      width={800}
      footer={
        isEditing
          ? null
          : [
              <Button
                key="edit"
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>,
              <Button
                key="close"
                icon={<CloseOutlined />}
                onClick={handleModalClose}
              >
                Close
              </Button>,
            ]
      }
    >
      {isEditing ? (
        <TaskForm
          task={task}
          onSubmit={handleUpdate}
          onCancel={handleCancel}
          loading={loading}
        />
      ) : (
        <>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Title">
              <Text strong>{task.title}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Description">
              <Text>{task.description || 'No description provided'}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag color={statusColors[task.status]}>{task.status}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Creator">
              <Space direction="vertical" size={0}>
                <Text strong>{task.creatorName || 'Unknown'}</Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {task.creatorEmail || ''}
                </Text>
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label="Start Date">
              <Text>
                {task.startDate
                  ? dayjs(task.startDate).format('MMMM D, YYYY')
                  : 'Not set'}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="End Date">
              <Text>
                {task.endDate
                  ? dayjs(task.endDate).format('MMMM D, YYYY')
                  : 'Not set'}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Duration">
              <Text>
                {task.startDate && task.endDate
                  ? `${dayjs(task.endDate).diff(dayjs(task.startDate), 'day')} days`
                  : 'Not applicable'}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Version">
              <Text type="secondary">v{task.version}</Text>
            </Descriptions.Item>

            <Descriptions.Item label="Created">
              <Text type="secondary">
                {dayjs(task.createdAt).format('MMMM D, YYYY [at] h:mm A')}
              </Text>
            </Descriptions.Item>

            <Descriptions.Item label="Last Updated">
              <Text type="secondary">
                {dayjs(task.updatedAt).format('MMMM D, YYYY [at] h:mm A')}
              </Text>
            </Descriptions.Item>
          </Descriptions>

          <Divider>Linked Issues</Divider>

          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Space>
              <Select
                placeholder="Select an issue to link"
                style={{ width: 300 }}
                value={selectedIssueId}
                onChange={setSelectedIssueId}
                showSearch
                optionFilterProp="children"
              >
                {availableIssues.map((issue) => (
                  <Option key={issue.id} value={issue.id}>
                    {issue.title} ({issue.severity})
                  </Option>
                ))}
              </Select>
              <Button
                type="primary"
                icon={<LinkOutlined />}
                onClick={handleLinkIssue}
                disabled={!selectedIssueId}
                loading={linkingIssue}
              >
                Link Issue
              </Button>
            </Space>

            <List
              dataSource={linkedIssues}
              locale={{ emptyText: 'No issues linked to this task' }}
              renderItem={(issue) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      title="Are you sure you want to unlink this issue?"
                      onConfirm={() => handleUnlinkIssue(issue.id)}
                      okText="Yes"
                      cancelText="No"
                    >
                      <Button
                        type="link"
                        danger
                        icon={<DisconnectOutlined />}
                        size="small"
                      >
                        Unlink
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text>{issue.title}</Text>
                        <Tag color={getStatusColor(issue.status)}>{issue.status}</Tag>
                        <Tag color={getSeverityColor(issue.severity)}>{issue.severity}</Tag>
                      </Space>
                    }
                    description={
                      <Text ellipsis style={{ maxWidth: 500 }}>
                        {issue.description}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Space>

          <Divider />

          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Task ID: {task.id}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              This task is synchronized in real-time across all connected clients.
            </Text>
          </Space>
        </>
      )}
    </Modal>
  );
};
