import React, { useState } from 'react';
import { Form, Input, Select, Button, message, DatePicker } from 'antd';
import { Issue } from '../../types/issue';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface IssueFormProps {
  initialValues?: Partial<Issue>;
  onSubmit: (values: Partial<Issue>) => Promise<void>;
  onCancel?: () => void;
  submitText?: string;
}

export const IssueForm: React.FC<IssueFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  submitText = '課題を登録',
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Convert dayjs to ISO string for dueDate
      const submitValues = {
        ...values,
        dueDate: values.dueDate ? dayjs(values.dueDate).toISOString() : undefined,
      };
      await onSubmit(submitValues);
      message.success('課題を保存しました');
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.error || '課題の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={
        initialValues ? {
          ...initialValues,
          dueDate: initialValues.dueDate ? dayjs(initialValues.dueDate) : undefined,
        } : {
          status: 'To Do',
          severity: 'Medium',
        }
      }
      onFinish={handleSubmit}
    >
      <Form.Item
        label="タイトル"
        name="title"
        rules={[
          { required: true, message: 'タイトルを入力してください' },
          { max: 255, message: 'タイトルは255文字以内で入力してください' },
        ]}
      >
        <Input placeholder="課題のタイトルを入力" />
      </Form.Item>

      <Form.Item
        label="説明"
        name="description"
        rules={[{ required: true, message: '説明を入力してください' }]}
      >
        <TextArea
          rows={4}
          placeholder="課題の詳細を入力"
        />
      </Form.Item>

      <Form.Item
        label="ステータス"
        name="status"
        rules={[{ required: true, message: 'ステータスを選択してください' }]}
      >
        <Select>
          <Option value="To Do">To Do</Option>
          <Option value="In Progress">In Progress</Option>
          <Option value="Complete">Complete</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="重要度"
        name="severity"
        rules={[{ required: true, message: '重要度を選択してください' }]}
      >
        <Select>
          <Option value="Low">低</Option>
          <Option value="Medium">中</Option>
          <Option value="High">高</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="完了予定日"
        name="dueDate"
      >
        <DatePicker
          showTime
          style={{ width: '100%' }}
          placeholder="完了予定日を選択"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
          {submitText}
        </Button>
        {onCancel && (
          <Button onClick={onCancel}>
            キャンセル
          </Button>
        )}
      </Form.Item>
    </Form>
  );
};
