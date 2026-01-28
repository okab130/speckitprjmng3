import React from 'react';
import { Card, Badge, Typography, Empty, Button, Space } from 'antd';
import { Droppable } from '@hello-pangea/dnd';
import { PlusOutlined } from '@ant-design/icons';
import { TaskWithCreator, TaskStatus } from '../../types/task';
import { Issue } from '../../types/issue';
import { KanbanCard } from './KanbanCard';

const { Title } = Typography;

type KanbanItem = (TaskWithCreator & { itemType: 'task' }) | (Issue & { itemType: 'issue' });

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: KanbanItem[];
  onTaskClick: (item: KanbanItem) => void;
  onCreateTask?: (status: TaskStatus) => void;
}

/**
 * KanbanColumn Component
 * 
 * Displays a column for a specific task status with droppable area.
 * Part of the Kanban board visualization (User Story 2).
 */
export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  status,
  tasks,
  onTaskClick,
  onCreateTask,
}) => {
  // Get column styling based on status
  const getColumnStyle = (status: TaskStatus) => {
    switch (status) {
      case 'To Do':
        return {
          color: '#595959',
          badgeColor: '#d9d9d9',
        };
      case 'In Progress':
        return {
          color: '#1890ff',
          badgeColor: '#1890ff',
        };
      case 'Complete':
        return {
          color: '#52c41a',
          badgeColor: '#52c41a',
        };
      default:
        return {
          color: '#595959',
          badgeColor: '#d9d9d9',
        };
    }
  };

  const columnStyle = getColumnStyle(status);

  return (
    <div style={{ flex: 1, minWidth: 280, maxWidth: 400 }}>
      <Card
        bordered={false}
        style={{
          height: '100%',
          backgroundColor: '#f7f8fa',
        }}
        bodyStyle={{
          padding: '12px',
          height: 'calc(100vh - 220px)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Column Header */}
        <Space
          style={{
            marginBottom: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Space size={8}>
            <Title
              level={5}
              style={{
                margin: 0,
                color: columnStyle.color,
                fontWeight: 600,
              }}
            >
              {status}
            </Title>
            <Badge
              count={tasks.length}
              style={{
                backgroundColor: columnStyle.badgeColor,
              }}
            />
          </Space>

          {/* Create task button */}
          {onCreateTask && (
            <Button
              type="text"
              size="small"
              icon={<PlusOutlined />}
              onClick={() => onCreateTask(status)}
              style={{ color: '#666' }}
            />
          )}
        </Space>

        {/* Droppable Area */}
        <Droppable droppableId={status}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '4px',
                backgroundColor: snapshot.isDraggingOver
                  ? '#e6f7ff'
                  : 'transparent',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease',
                border: snapshot.isDraggingOver
                  ? '2px dashed #1890ff'
                  : '2px dashed transparent',
              }}
            >
              {/* Item Cards */}
              {tasks.length > 0 ? (
                tasks.map((item, index) => (
                  <KanbanCard
                    key={item.id}
                    item={item}
                    index={index}
                    onClick={onTaskClick}
                  />
                ))
              ) : (
                /* Empty State */
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <span style={{ color: '#999', fontSize: '12px' }}>
                      No items in {status}
                    </span>
                  }
                  style={{
                    marginTop: '40px',
                  }}
                >
                  {onCreateTask && (
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => onCreateTask(status)}
                    >
                      Create Task
                    </Button>
                  )}
                </Empty>
              )}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </Card>
    </div>
  );
};
