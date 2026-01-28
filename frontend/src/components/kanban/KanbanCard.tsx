import React from 'react';
import { Card, Tag, Typography, Space, Badge } from 'antd';
import { Draggable } from '@hello-pangea/dnd';
import { UserOutlined, CalendarOutlined, BugOutlined } from '@ant-design/icons';
import { TaskWithCreator } from '../../types/task';
import { Issue } from '../../types/issue';

const { Text, Paragraph } = Typography;

type KanbanItem = (TaskWithCreator & { itemType: 'task' }) | (Issue & { itemType: 'issue' });

interface KanbanCardProps {
  item: KanbanItem;
  index: number;
  onClick: (item: KanbanItem) => void;
}

/**
 * KanbanCard Component
 * 
 * Displays a draggable card for tasks or issues.
 * Part of the Kanban board visualization (User Story 2).
 */
export const KanbanCard: React.FC<KanbanCardProps> = ({ item, index, onClick }) => {
  const isTask = item.itemType === 'task';
  const task = isTask ? (item as TaskWithCreator) : null;
  const issue = !isTask ? (item as Issue) : null;

  // Format date for display
  const formatDate = (date?: Date | string): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get status badge color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'To Do':
        return 'default';
      case 'In Progress':
        return 'processing';
      case 'Complete':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get severity color for issues
  const getSeverityColor = (severity?: string): string => {
    switch (severity) {
      case 'High':
        return '#ff4d4f';
      case 'Medium':
        return '#faad14';
      case 'Low':
        return '#52c41a';
      default:
        return '#d9d9d9';
    }
  };

  // Get background color based on item type and status
  const getItemBackgroundColor = (item: KanbanItem): string => {
    if (item.itemType === 'issue') {
      // Issue colors match Gantt chart
      switch (item.status) {
        case 'Complete':
          return '#fff7e6'; // Light orange background
        case 'In Progress':
          return '#fff1e6'; // Light dark orange background
        case 'To Do':
          return '#fffbe6'; // Light yellow background
        default:
          return '#ffffff';
      }
    }
    return '#ffffff'; // White for tasks
  };

  // Get border color based on item type and status
  const getItemBorderColor = (item: KanbanItem, isDragging: boolean): string => {
    if (isDragging) {
      return item.itemType === 'issue' ? '#fa8c16' : '#1890ff';
    }
    if (item.itemType === 'issue') {
      // Issue border colors match Gantt chart
      switch (item.status) {
        case 'Complete':
          return '#faad14'; // Orange
        case 'In Progress':
          return '#fa8c16'; // Dark Orange
        case 'To Do':
          return '#ffd666'; // Light Orange
        default:
          return '#d9d9d9';
      }
    }
    return '#d9d9d9'; // Gray for tasks
  };

  return (
    <Draggable draggableId={item.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: 8,
          }}
        >
          <Card
            size="small"
            hoverable
            onClick={() => onClick(item)}
            style={{
              cursor: 'pointer',
              backgroundColor: snapshot.isDragging ? '#f0f5ff' : getItemBackgroundColor(item),
              boxShadow: snapshot.isDragging
                ? '0 4px 12px rgba(0, 0, 0, 0.15)'
                : '0 1px 2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              border: `1px solid ${getItemBorderColor(item, snapshot.isDragging)}`,
            }}
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {/* Type Badge and Title */}
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text strong style={{ fontSize: '14px' }}>
                  {item.title}
                </Text>
                {!isTask && (
                  <Badge 
                    color={getSeverityColor(issue?.severity)} 
                    text={
                      <Space size={4}>
                        <BugOutlined style={{ fontSize: '12px' }} />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {issue?.severity}
                        </Text>
                      </Space>
                    }
                  />
                )}
              </Space>

              {/* Description (truncated) */}
              {item.description && (
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  style={{ margin: 0, color: '#666', fontSize: '12px' }}
                >
                  {item.description}
                </Paragraph>
              )}

              {/* Footer: Creator and dates */}
              <Space
                split={<span style={{ color: '#d9d9d9' }}>•</span>}
                size={4}
                style={{ fontSize: '11px', color: '#999' }}
              >
                <Space size={4}>
                  <UserOutlined />
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {isTask ? task?.creatorName : issue?.creatorName || 'Unknown'}
                  </Text>
                </Space>

                {isTask && (task?.startDate || task?.endDate) && (
                  <Space size={4}>
                    <CalendarOutlined />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      {formatDate(task.startDate)}
                      {task.startDate && task.endDate && ' - '}
                      {formatDate(task.endDate)}
                    </Text>
                  </Space>
                )}

                {!isTask && issue?.dueDate && (
                  <Space size={4}>
                    <CalendarOutlined />
                    <Text type="secondary" style={{ fontSize: '11px' }}>
                      Due: {formatDate(issue.dueDate)}
                    </Text>
                  </Space>
                )}
              </Space>

              {/* Status badge (shown during drag) */}
              {snapshot.isDragging && (
                <Tag color={getStatusColor(item.status)} style={{ fontSize: '11px' }}>
                  {item.status}
                </Tag>
              )}
            </Space>
          </Card>
        </div>
      )}
    </Draggable>
  );
};
