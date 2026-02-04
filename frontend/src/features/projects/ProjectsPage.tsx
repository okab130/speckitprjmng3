import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Modal, message, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useProjectStore } from '../../store/projectStore';
import { ProjectForm } from './ProjectForm';
import { Project, ProjectStatus } from '../../types/project';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    isLoading,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    selectedProject,
    setSelectedProject,
  } = useProjectStore();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (data: any) => {
    await createProject(data);
    setIsModalVisible(false);
    setSelectedProject(null);
  };

  const handleUpdateProject = async (data: any) => {
    if (!selectedProject) return;
    await updateProject(selectedProject.id, data);
    setIsModalVisible(false);
    setSelectedProject(null);
    setIsEditMode(false);
  };

  const handleDeleteProject = async (id: string) => {
    try {
      await deleteProject(id);
      message.success('プロジェクトを削除しました');
    } catch (error: any) {
      message.error('プロジェクトの削除に失敗しました');
    }
  };

  const handleEditClick = (project: Project) => {
    setSelectedProject(project);
    setIsEditMode(true);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedProject(null);
    setIsEditMode(false);
  };

  const getStatusTag = (status: ProjectStatus) => {
    const config = {
      Active: { color: 'green', text: '進行中' },
      Archived: { color: 'default', text: 'アーカイブ' },
      Completed: { color: 'blue', text: '完了' },
    };
    const { color, text } = config[status];
    return <Tag color={color}>{text}</Tag>;
  };

  const columns: ColumnsType<Project> = [
    {
      title: 'プロジェクト名',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: '説明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'ステータス',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ProjectStatus) => getStatusTag(status),
      filters: [
        { text: '進行中', value: 'Active' },
        { text: 'アーカイブ', value: 'Archived' },
        { text: '完了', value: 'Completed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '作成日',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
    {
      title: '更新日',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.updatedAt).unix() - dayjs(b.updatedAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
          >
            編集
          </Button>
          <Popconfirm
            title="プロジェクトを削除しますか？"
            description="関連するすべてのタスクと課題も削除されます。"
            onConfirm={() => handleDeleteProject(record.id)}
            okText="削除"
            cancelText="キャンセル"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              削除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>プロジェクト管理</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsEditMode(false);
              setSelectedProject(null);
              setIsModalVisible(true);
            }}
          >
            新規プロジェクト作成
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `全 ${total} 件`,
          }}
        />
      </Card>

      <Modal
        title={isEditMode ? 'プロジェクト編集' : '新規プロジェクト作成'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <ProjectForm
          project={isEditMode ? selectedProject : null}
          onSubmit={isEditMode ? handleUpdateProject : handleCreateProject}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
};
