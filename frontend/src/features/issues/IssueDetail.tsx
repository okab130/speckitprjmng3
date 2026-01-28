import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Button, Divider, message, Space } from 'antd';
import { EditOutlined, CalendarOutlined } from '@ant-design/icons';
import { Issue } from '../../types/issue';
import { useIssues } from '../../hooks/useIssues';
import { IssueCommentList } from './IssueCommentList';

interface IssueDetailProps {
  issueId: string;
  visible: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const IssueDetail: React.FC<IssueDetailProps> = ({
  issueId,
  visible,
  onClose,
  onEdit,
}) => {
  const { fetchIssueById } = useIssues();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && issueId) {
      loadIssue();
    }
  }, [visible, issueId]);

  const loadIssue = async () => {
    setLoading(true);
    try {
      const data = await fetchIssueById(issueId);
      setIssue(data);
    } catch (error) {
      message.error('課題の詳細読み込みに失敗しました');
    } finally {
      setLoading(false);
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

  return (
    <Modal
      title={
        <Space>
          <span>課題の詳細</span>
          {onEdit && (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={onEdit}
              size="small"
            >
              編集
            </Button>
          )}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          閉じる
        </Button>,
      ]}
      loading={loading}
    >
      {issue && (
        <>
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="タイトル" span={2}>
              {issue.title}
            </Descriptions.Item>
            <Descriptions.Item label="説明" span={2}>
              {issue.description}
            </Descriptions.Item>
            <Descriptions.Item label="ステータス">
              <Tag color={getStatusColor(issue.status)}>{issue.status}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="重要度">
              <Tag color={getSeverityColor(issue.severity)}>{getSeverityLabel(issue.severity)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="起票日">
              <Space>
                <CalendarOutlined />
                {new Date(issue.createdAt).toLocaleString('ja-JP')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="完了予定日">
              {issue.dueDate ? (
                <Space>
                  <CalendarOutlined />
                  {new Date(issue.dueDate).toLocaleString('ja-JP')}
                </Space>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="完了日">
              {issue.resolvedAt ? (
                <Space>
                  <CalendarOutlined />
                  {new Date(issue.resolvedAt).toLocaleString('ja-JP')}
                </Space>
              ) : (
                '未完了'
              )}
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">対応履歴</Divider>
          
          <IssueCommentList issueId={issue.id} />
        </>
      )}
    </Modal>
  );
};
