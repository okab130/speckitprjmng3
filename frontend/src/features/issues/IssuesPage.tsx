import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { IssueList } from './IssueList';
import { IssueForm } from './IssueForm';
import { useIssues } from '../../hooks/useIssues';
import { ProjectSelector } from '../projects/ProjectSelector';
import { useProjectStore } from '../../store/projectStore';

export const IssuesPage: React.FC = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { createIssue, fetchIssues } = useIssues();
  const { currentProjectId } = useProjectStore();

  useEffect(() => {
    fetchIssues({ projectId: currentProjectId || undefined });
  }, [currentProjectId, fetchIssues]);

  const handleCreate = async (values: any) => {
    await createIssue(values);
    setIsCreateModalVisible(false);
  };

  const handleProjectChange = (projectId: string | null) => {
    fetchIssues({ projectId: projectId || undefined });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title="課題管理"
        extra={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <ProjectSelector
              onChange={handleProjectChange}
              showAllOption
              style={{ width: 200 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
            >
              課題を追加
            </Button>
          </div>
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
