import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useFunctionStore } from '../../store/functionStore';
import { CreateFunctionDto } from '../../types/function';
import type { ColumnsType } from 'antd/es/table';

interface FunctionData {
  id: string;
  system_name: string;
  function_name: string;
  function_detail: string;
  created_at: string;
}

const FunctionMasterPage: React.FC = () => {
  const { functions, isLoading, fetchFunctions, createFunction, deleteFunction } = useFunctionStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFunctions();
  }, [fetchFunctions]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      await createFunction(values as CreateFunctionDto);
      message.success('機能を登録しました');
      setIsModalOpen(false);
      form.resetFields();
    } catch (error: any) {
      if (error.response?.status === 409) {
        message.error('この機能は既に登録されています');
      } else {
        message.error('機能の登録に失敗しました');
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFunction(id);
      message.success('機能を削除しました');
    } catch (error) {
      message.error('機能の削除に失敗しました');
    }
  };

  const columns: ColumnsType<FunctionData> = [
    {
      title: 'システム名',
      dataIndex: 'system_name',
      key: 'system_name',
      width: '30%',
      sorter: (a, b) => a.system_name.localeCompare(b.system_name),
    },
    {
      title: '機能名',
      dataIndex: 'function_name',
      key: 'function_name',
      width: '25%',
      sorter: (a, b) => a.function_name.localeCompare(b.function_name),
    },
    {
      title: '機能詳細',
      dataIndex: 'function_detail',
      key: 'function_detail',
      width: '30%',
    },
    {
      title: '操作',
      key: 'action',
      width: '15%',
      render: (_, record) => (
        <Popconfirm
          title="削除確認"
          description="この機能を削除してもよろしいですか？"
          onConfirm={() => handleDelete(record.id)}
          okText="削除"
          cancelText="キャンセル"
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            削除
          </Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>機能マスタ管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
          機能を追加
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={functions}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="機能の追加"
        open={isModalOpen}
        onOk={handleCreate}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        okText="登録"
        cancelText="キャンセル"
      >
        <Form form={form} layout="vertical" style={{ marginTop: '20px' }}>
          <Form.Item
            name="system_name"
            label="システム名"
            rules={[{ required: true, message: 'システム名を入力してください' }]}
          >
            <Input placeholder="例: 在庫管理システム" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="function_name"
            label="機能名"
            rules={[{ required: true, message: '機能名を入力してください' }]}
          >
            <Input placeholder="例: マスタ管理" maxLength={100} />
          </Form.Item>

          <Form.Item
            name="function_detail"
            label="機能詳細"
            rules={[{ required: true, message: '機能詳細を入力してください' }]}
          >
            <Input placeholder="例: 商品マスタ" maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FunctionMasterPage;
