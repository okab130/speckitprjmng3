import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Popconfirm, Modal, Select, message } from 'antd';
import { EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons';
import { useIssues } from '../../hooks/useIssues';
import { Issue } from '../../types/issue';
import { IssueForm } from './IssueForm';

const { Option } = Select;

export const IssueList: React.FC = () => {
  const { issues, loading, fetchIssues, updateIssue, deleteIssue } = useIssues();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);
  const [filterSeverity, setFilterSeverity] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchIssues({ status: filterStatus, severity: filterSeverity });
  }, [filterStatus, filterSeverity]);

  const handleEdit = (issue: Issue) => {
    setEditingIssue(issue);
    setIsEditModalVisible(true);
  };

  const handleUpdate = async (values: Partial<Issue>) => {
    if (!editingIssue) return;
    
    try {
      await updateIssue(editingIssue.id, values);
      setIsEditModalVisible(false);
      setEditingIssue(null);
    } catch (error) {
      // Error handled by form
    }
  };

  const handleResolve = async (issue: Issue) => {
    try {
      await updateIssue(issue.id, { status: 'Complete' });
      message.success('課題を完了にしました');
    } catch (error: any) {
      message.error(error.response?.data?.error || '課題のステータス変更に失敗しました');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteIssue(id);
      message.success('課題を削除しました');
    } catch (error: any) {
      message.error(error.response?.data?.error || '課題の削除に失敗しました');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'To Do':
        return 'default';
      case 'In Progress':
        return 'blue';
      case 'Complete':
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

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'High':
        return '高';
      case 'Medium':
        return '中';
      case 'Low':
        return '低';
      default:
        return severity;
    }
  };

  const columns = [
    {
      title: 'タイトル',
      dataIndex: 'title',
      key: 'title',
      width: '25%',
    },
    {
      title: '説明',
      dataIndex: 'description',
      key: 'description',
      width: '25%',
      ellipsis: true,
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '重要度',
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: string) => (
        <Tag color={getSeverityColor(severity)}>{getSeverityLabel(severity)}</Tag>
      ),
    },
    {
      title: '起票日',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ja-JP'),
    },
    {
      title: '完了予定日',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string | null) => 
        date ? new Date(date).toLocaleDateString('ja-JP') : '-',
    },
    {
      title: '完了日',
      dataIndex: 'resolvedAt',
      key: 'resolvedAt',
      render: (date: string | null) => 
        date ? new Date(date).toLocaleDateString('ja-JP') : '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, issue: Issue) => (
        <Space size="small">
          {issue.status !== 'Complete' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleResolve(issue)}
              title="完了にする"
            />
          )}
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(issue)}
          />
          <Popconfirm
            title="この課題を削除してもよろしいですか？"
            onConfirm={() => handleDelete(issue.id)}
            okText="はい"
            cancelText="いいえ"
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="ステータスで絞り込み"
          allowClear
          style={{ width: 180 }}
          onChange={(value) => setFilterStatus(value)}
        >
          <Option value="To Do">To Do</Option>
          <Option value="In Progress">In Progress</Option>
          <Option value="Complete">Complete</Option>
        </Select>
        <Select
          placeholder="重要度で絞り込み"
          allowClear
          style={{ width: 150 }}
          onChange={(value) => setFilterSeverity(value)}
        >
          <Option value="High">高</Option>
          <Option value="Medium">中</Option>
          <Option value="Low">低</Option>
        </Select>
      </Space>

      <Table
        dataSource={issues}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="課題の編集"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingIssue(null);
        }}
        footer={null}
      >
        {editingIssue && (
          <IssueForm
            initialValues={editingIssue}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditModalVisible(false);
              setEditingIssue(null);
            }}
            submitText="課題を更新"
          />
        )}
      </Modal>
    </>
  );
};
