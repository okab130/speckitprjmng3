import React, { useState } from 'react';
import { Card, Button, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { IssueList } from './IssueList';
import { IssueForm } from './IssueForm';
import { useIssues } from '../../hooks/useIssues';

export const IssuesPage: React.FC = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { createIssue } = useIssues();

  const handleCreate = async (values: any) => {
    await createIssue(values);
    setIsCreateModalVisible(false);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="課題管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreateModalVisible(true)}
          >
            課題を追加
          </Button>
        }
      >
        <IssueList />
      </Card>

      <Modal
        title="課題の新規作成"
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
      >
        <IssueForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalVisible(false)}
          submitText="課題を登録"
        />
      </Modal>
    </div>
  );
};
