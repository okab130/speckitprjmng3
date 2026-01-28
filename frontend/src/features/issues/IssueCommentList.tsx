import React, { useEffect, useState } from 'react';
import { List, Input, Button, Space, Card, Typography, Popconfirm, message, Avatar, Empty } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { useIssueCommentStore } from '../../store/issueCommentStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { IssueComment } from '../../types/issueComment';

const { TextArea } = Input;
const { Text } = Typography;

interface IssueCommentListProps {
  issueId: string;
}

export const IssueCommentList: React.FC<IssueCommentListProps> = ({ issueId }) => {
  const {
    comments,
    loading,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    handleCommentCreated,
    handleCommentUpdated,
    handleCommentDeleted,
  } = useIssueCommentStore();

  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const issueComments = comments[issueId] || [];

  // Load comments on mount
  useEffect(() => {
    fetchComments(issueId);
  }, [issueId, fetchComments]);

  // WebSocket real-time updates
  useWebSocket('issue:comment:created', (event: any) => {
    const comment = event as IssueComment & { issueId: string };
    handleCommentCreated(comment);
  });

  useWebSocket('issue:comment:updated', (event: any) => {
    const comment = event as IssueComment & { issueId: string };
    handleCommentUpdated(comment);
  });

  useWebSocket('issue:comment:deleted', (event: any) => {
    const payload = event as { id: string; issueId: string };
    handleCommentDeleted(payload);
  });

  // Handle create comment
  const handleSubmit = async () => {
    if (!newComment.trim()) {
      message.warning('対応内容を入力してください');
      return;
    }

    setSubmitting(true);
    try {
      await createComment(issueId, { content: newComment.trim() });
      setNewComment('');
      message.success('対応履歴を追加しました');
    } catch (error) {
      message.error('対応履歴の追加に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle start edit
  const handleStartEdit = (comment: IssueComment) => {
    setEditingId(comment.id);
    setEditingContent(comment.content);
  };

  // Handle save edit
  const handleSaveEdit = async (commentId: string) => {
    if (!editingContent.trim()) {
      message.warning('対応内容を入力してください');
      return;
    }

    setSubmitting(true);
    try {
      await updateComment(issueId, commentId, { content: editingContent.trim() });
      setEditingId(null);
      setEditingContent('');
      message.success('対応履歴を更新しました');
    } catch (error) {
      message.error('対応履歴の更新に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingContent('');
  };

  // Handle delete
  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(issueId, commentId);
      message.success('対応履歴を削除しました');
    } catch (error) {
      message.error('対応履歴の削除に失敗しました');
    }
  };

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* Comment Input */}
      <Card size="small" style={{ marginBottom: 16, backgroundColor: '#fafafa' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="対応内容を入力してください..."
            rows={3}
            maxLength={10000}
            showCount
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={submitting}
            disabled={!newComment.trim()}
          >
            追加
          </Button>
        </Space>
      </Card>

      {/* Comments List */}
      {issueComments.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="対応履歴がありません"
          style={{ marginTop: 20 }}
        />
      ) : (
        <List
          dataSource={issueComments}
          loading={loading}
          renderItem={(comment) => (
            <List.Item
              key={comment.id}
              style={{ padding: '12px 0' }}
            >
              <Card size="small" style={{ width: '100%' }}>
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <Space>
                      <Text strong>{comment.userName}</Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        {formatDate(comment.createdAt)}
                      </Text>
                      {comment.createdAt !== comment.updatedAt && (
                        <Text type="secondary" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                          (編集済み)
                        </Text>
                      )}
                    </Space>
                  }
                  description={
                    editingId === comment.id ? (
                      <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                        <TextArea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          rows={3}
                          maxLength={10000}
                          showCount
                        />
                        <Space>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => handleSaveEdit(comment.id)}
                            loading={submitting}
                          >
                            保存
                          </Button>
                          <Button size="small" onClick={handleCancelEdit}>
                            キャンセル
                          </Button>
                        </Space>
                      </Space>
                    ) : (
                      <div style={{ marginTop: 8 }}>
                        <Text style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</Text>
                      </div>
                    )
                  }
                />
                {editingId !== comment.id && (
                  <div style={{ marginTop: 8 }}>
                    <Space size="small">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleStartEdit(comment)}
                      >
                        編集
                      </Button>
                      <Popconfirm
                        title="この対応履歴を削除しますか？"
                        onConfirm={() => handleDelete(comment.id)}
                        okText="削除"
                        cancelText="キャンセル"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                        >
                          削除
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                )}
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};
