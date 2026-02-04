import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, Space, message } from 'antd';
import { Project, CreateProjectInput, UpdateProjectInput, ProjectStatus } from '../../types/project';

const { TextArea } = Input;
const { Option } = Select;

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const statusOptions: ProjectStatus[] = ['Active', 'Archived', 'Completed'];

export const ProjectForm: React.FC<ProjectFormProps> = ({
  project,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      form.setFieldsValue({
        name: project.name,
        description: project.description || '',
        status: project.status,
      });
    } else {
      form.resetFields();
    }
  }, [project, form]);

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      const projectData: CreateProjectInput | UpdateProjectInput = {
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
        status: values.status || 'Active',
        ...(project && { version: project.version }),
      };

      await onSubmit(projectData);
      
      message.success(project ? 'プロジェクトを更新しました' : 'プロジェクトを作成しました');
      
      if (!project) {
        form.resetFields();
      }
    } catch (error: any) {
      console.error('Project form submission error:', error);
      
      if (error.response?.status === 409) {
        message.error('プロジェクトが他のユーザーによって変更されました。再読み込みしてください。');
      } else {
        message.error(error.response?.data?.error || 'プロジェクトの保存に失敗しました');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={{ status: 'Active' }}
    >
      <Form.Item
        name="name"
        label="プロジェクト名"
        rules={[
          { required: true, message: 'プロジェクト名を入力してください' },
          { max: 255, message: 'プロジェクト名は255文字以内で入力してください' },
        ]}
      >
        <Input placeholder="プロジェクト名を入力" />
      </Form.Item>

      <Form.Item
        name="description"
        label="説明"
      >
        <TextArea
          rows={4}
          placeholder="プロジェクトの説明を入力（任意）"
        />
      </Form.Item>

      <Form.Item
        name="status"
        label="ステータス"
        rules={[{ required: true, message: 'ステータスを選択してください' }]}
      >
        <Select placeholder="ステータスを選択">
          {statusOptions.map((status) => (
            <Option key={status} value={status}>
              {status === 'Active' ? '進行中' : status === 'Archived' ? 'アーカイブ' : '完了'}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting || loading}
          >
            {project ? 'プロジェクトを更新' : 'プロジェクトを作成'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel} disabled={isSubmitting || loading}>
              キャンセル
            </Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  );
};
