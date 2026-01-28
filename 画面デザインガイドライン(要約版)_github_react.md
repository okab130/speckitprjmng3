# React+FastAPI 企業基幹業務アプリケーション 画面デザインガイドライン（要約版）

> **対象**: 企業基幹業務システム（spec-kit）  
> **技術スタック**: React 18+ / FastAPI / TypeScript  
> **AI推論最適化**: 要点を凝縮した実装ガイド

---

## 🎯 基本方針

### デザインコンセプト
- **企業向けモダンUI**: 直感的操作・高い生産性
- **一貫性**: 統一されたデザインシステム
- **拡張性**: コンポーネント再利用・保守性重視
- **パフォーマンス**: 大量データ処理・レスポンス最適化

---

## 📦 推奨ライブラリ構成

### コアスタック
```bash
# React基盤
npm install react@18.2.0 react-dom@18.2.0 react-router-dom@6.20.0
npm install -D typescript@5.3.3 @types/react @types/react-dom

# 状態管理
npm install zustand@4.4.7  # シンプルで高速

# UIフレームワーク（企業向け最適）
npm install antd@5.12.0  # Ant Design - 企業システムに最適
npm install @ant-design/icons@5.2.6

# フォーム管理
npm install react-hook-form@7.49.2 zod@3.22.4 @hookform/resolvers@3.3.3
```

### 機能別ライブラリ
```bash
# データテーブル
npm install @tanstack/react-table@8.11.0  # 高機能・軽量
npm install papaparse@5.4.1 @types/papaparse  # CSV処理

# PDF処理
npm install react-pdf@7.6.0 pdf-lib@1.17.1  # プレビュー・編集
npm install crypto-js@4.2.0 @types/crypto-js  # 暗号化

# ファイル管理
npm install react-dropzone@14.2.3  # ドラッグ&ドロップ

# ガントチャート
npm install gantt-task-react@0.3.9  # 予定・実績管理
npm install date-fns@3.0.0  # 日付操作

# ツリー表示
npm install react-complex-tree@2.3.0  # エクスプローラ風UI

# KANBANボード
npm install @hello-pangea/dnd@16.5.0  # react-beautiful-dnd後継

# チャット
npm install react-markdown@9.0.1  # マークダウン表示
npm install dayjs@1.11.10  # 軽量日時ライブラリ

# API通信
npm install axios@1.6.2 swr@2.2.4  # データフェッチング
```

---

## 🎨 デザインシステム

### カラーパレット（Ant Design拡張）
```typescript
// src/styles/theme.ts
export const themeConfig = {
  token: {
    colorPrimary: '#1677ff',      // プライマリ：アクション
    colorSuccess: '#52c41a',      // 成功
    colorWarning: '#faad14',      // 警告
    colorError: '#ff4d4f',        // エラー
    colorInfo: '#1677ff',         // 情報
    colorBgContainer: '#ffffff',  // 背景
    borderRadius: 6,              // 角丸
    fontSize: 14,                 // 基本フォント
  },
};
```

### レイアウト構造
```tsx
// src/layouts/MainLayout.tsx
import { Layout, Menu } from 'antd';
const { Header, Sider, Content } = Layout;

export const MainLayout = ({ children }) => (
  <Layout style={{ minHeight: '100vh' }}>
    <Header style={{ background: '#001529', padding: '0 24px' }}>
      {/* ヘッダーコンテンツ */}
    </Header>
    <Layout>
      <Sider width={240} theme="light">
        {/* サイドメニュー */}
      </Sider>
      <Content style={{ margin: '24px', padding: 24, background: '#fff' }}>
        {children}
      </Content>
    </Layout>
  </Layout>
);
```

---

## 🛠️ 機能別実装ガイド

### 1. タブ構成画面
```tsx
import { Tabs } from 'antd';

const TabsExample = () => (
  <Tabs
    defaultActiveKey="1"
    items={[
      { key: '1', label: '基本情報', children: <BasicInfo /> },
      { key: '2', label: '詳細設定', children: <DetailSettings /> },
      { key: '3', label: '履歴', children: <History /> },
    ]}
  />
);
```

### 2. データテーブル（TanStack Table）
```tsx
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { Table, Button } from 'antd';
import Papa from 'papaparse';

const DataTable = ({ data, columns }) => {
  const [rowSelection, setRowSelection] = useState({});
  
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    enableRowSelection: true,
  });

  // CSV出力
  const exportCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'export.csv';
    a.click();
  };

  return (
    <>
      <Button onClick={exportCSV}>CSV出力</Button>
      {/* テーブル実装 */}
    </>
  );
};
```

**Antd Tableの方が簡潔（推奨）**:
```tsx
import { Table, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  name: string;
  age: number;
}

const columns: ColumnsType<DataType> = [
  { title: '名前', dataIndex: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: '年齢', dataIndex: 'age', sorter: (a, b) => a.age - b.age },
];

const DataTable = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  const exportCSV = () => {
    const csv = Papa.unparse(data);
    // CSV出力処理
  };

  return (
    <Table
      rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      columns={columns}
      dataSource={data}
    />
  );
};
```

### 3. 添付ファイル機能
```tsx
import { Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const FileUpload = () => (
  <Upload.Dragger
    name="file"
    multiple
    action="/api/upload"
    onChange={(info) => {
      const { status } = info.file;
      if (status === 'done') {
        message.success(`${info.file.name} アップロード成功`);
      }
    }}
  >
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p>ファイルをドラッグ&ドロップ</p>
  </Upload.Dragger>
);
```

### 4. PDFプレビュー・暗号化
```tsx
import { Document, Page } from 'react-pdf';
import { PDFDocument } from 'pdf-lib';
import CryptoJS from 'crypto-js';

const PDFViewer = ({ url }: { url: string }) => {
  const [numPages, setNumPages] = useState<number>(0);
  
  return (
    <Document file={url} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
      {Array.from(new Array(numPages), (_, i) => (
        <Page key={`page_${i + 1}`} pageNumber={i + 1} />
      ))}
    </Document>
  );
};

// PDF暗号化
const encryptPDF = async (pdfBytes: Uint8Array, password: string) => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  pdfDoc.encrypt({
    userPassword: password,
    ownerPassword: password,
  });
  return await pdfDoc.save();
};

// ファイル暗号化（汎用）
const encryptFile = (file: File, password: string): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const encrypted = CryptoJS.AES.encrypt(
        e.target.result as string,
        password
      ).toString();
      resolve(encrypted);
    };
    reader.readAsDataURL(file);
  });
};
```

### 5. ガントチャート
```tsx
import { Gantt, Task, ViewMode } from 'gantt-task-react';
import 'gantt-task-react/dist/index.css';

interface GanttTask extends Task {
  planned?: { start: Date; end: Date };
  actual?: { start: Date; end: Date };
}

const GanttChart = () => {
  const tasks: GanttTask[] = [
    {
      id: '1',
      name: 'タスクA',
      start: new Date(2024, 0, 1),
      end: new Date(2024, 0, 15),
      type: 'task',
      progress: 60,
      planned: { start: new Date(2024, 0, 1), end: new Date(2024, 0, 10) },
      actual: { start: new Date(2024, 0, 2), end: new Date(2024, 0, 15) },
    },
  ];

  return (
    <Gantt
      tasks={tasks}
      viewMode={ViewMode.Day}
      locale="ja"
      listCellWidth="200px"
    />
  );
};
```

### 6. エクスプローラ風UI
```tsx
import { Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';

const FileExplorer = () => {
  const treeData: DataNode[] = [
    {
      title: 'ルートフォルダ',
      key: '0-0',
      children: [
        { title: 'ファイル1.pdf', key: '0-0-0', isLeaf: true },
        { title: 'ファイル2.xlsx', key: '0-0-1', isLeaf: true },
      ],
    },
  ];

  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  return (
    <div style={{ display: 'flex' }}>
      <Tree
        treeData={treeData}
        selectedKeys={selectedKeys}
        onSelect={(keys) => setSelectedKeys(keys)}
        style={{ width: 300 }}
      />
      <div style={{ flex: 1, padding: 24 }}>
        {/* 右側ファイルリスト */}
      </div>
    </div>
  );
};
```

### 7. KANBANボード
```tsx
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

interface Task {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  taskIds: string[];
}

const KanbanBoard = () => {
  const [columns, setColumns] = useState<Record<string, Column>>({
    'todo': { id: 'todo', title: '未着手', taskIds: ['task-1'] },
    'inProgress': { id: 'inProgress', title: '進行中', taskIds: [] },
    'done': { id: 'done', title: '完了', taskIds: [] },
  });

  const onDragEnd = (result: any) => {
    // ドラッグ終了処理
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {Object.values(columns).map((column) => (
        <Droppable key={column.id} droppableId={column.id}>
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              <h3>{column.title}</h3>
              {/* タスクカード */}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      ))}
    </DragDropContext>
  );
};
```

### 8. チャット機能
```tsx
import { Input, Avatar, List } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import dayjs from 'dayjs';

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: Date;
}

const ChatComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      user: 'CurrentUser',
      content: input,
      timestamp: new Date(),
    };
    setMessages([...messages, newMsg]);
    setInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <List
        dataSource={messages}
        renderItem={(msg) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar>{msg.user[0]}</Avatar>}
              title={`${msg.user} - ${dayjs(msg.timestamp).format('HH:mm')}`}
              description={<ReactMarkdown>{msg.content}</ReactMarkdown>}
            />
          </List.Item>
        )}
        style={{ flex: 1, overflow: 'auto' }}
      />
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onPressEnter={sendMessage}
        suffix={<SendOutlined onClick={sendMessage} />}
        placeholder="メッセージを入力..."
      />
    </div>
  );
};
```

---

## 🔌 FastAPI連携

### API通信設定
```typescript
// src/lib/api.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
});

// リクエストインターセプター（JWT認証）
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

### SWRによるデータフェッチング（推奨）
```tsx
import useSWR from 'swr';
import { apiClient } from '@/lib/api';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

const DataComponent = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/items', fetcher);

  if (isLoading) return <Spin />;
  if (error) return <Alert type="error" message="読込エラー" />;

  return <Table dataSource={data} />;
};
```

### ファイルアップロード（FastAPI）
```typescript
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
```

---

## 📱 レスポンシブデザイン

### Ant Design Grid System
```tsx
import { Row, Col } from 'antd';

const ResponsiveLayout = () => (
  <Row gutter={[16, 16]}>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card>コンテンツ1</Card>
    </Col>
    <Col xs={24} sm={12} md={8} lg={6}>
      <Card>コンテンツ2</Card>
    </Col>
  </Row>
);
```

---

## ♿ アクセシビリティ

### 必須対応
- **キーボード操作**: すべての機能をキーボードで操作可能
- **ARIAラベル**: `aria-label`, `aria-describedby`を適切に設定
- **フォーカス管理**: `autoFocus`プロパティで初期フォーカス
- **色コントラスト**: WCAG AA基準準拠（4.5:1以上）

```tsx
<Button
  aria-label="保存"
  tabIndex={0}
  onClick={handleSave}
>
  保存
</Button>
```

---

## ⚡ パフォーマンス最適化

### 重要施策
1. **遅延ロード**: `React.lazy()` + `Suspense`
```tsx
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Spin />}>
  <HeavyComponent />
</Suspense>
```

2. **仮想スクロール**: 大量データ表示（Ant Design Table標準対応）
```tsx
<Table
  virtual
  scroll={{ y: 400 }}
  dataSource={largeDataset}
/>
```

3. **メモ化**: `React.memo`, `useMemo`, `useCallback`
```tsx
const MemoizedComponent = React.memo(({ data }) => {
  const processed = useMemo(() => expensiveOperation(data), [data]);
  return <div>{processed}</div>;
});
```

---

## 🧪 テスト推奨構成

```bash
npm install -D vitest@1.1.0 @testing-library/react@14.1.2
npm install -D @testing-library/jest-dom@6.1.5
```

```tsx
// Example.test.tsx
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';

test('renders button', () => {
  render(<Button>Click</Button>);
  expect(screen.getByText('Click')).toBeInTheDocument();
});
```

---

## 📐 プロジェクト構造（推奨）

```
src/
├── components/       # 再利用可能なコンポーネント
│   ├── common/      # 汎用コンポーネント
│   ├── tables/      # テーブル関連
│   ├── charts/      # ガントチャート等
│   └── kanban/      # KANBANボード
├── features/        # 機能単位のモジュール
│   ├── auth/
│   ├── documents/
│   └── projects/
├── layouts/         # レイアウトコンポーネント
├── lib/             # ユーティリティ・API
├── hooks/           # カスタムフック
├── store/           # Zustand store
├── types/           # TypeScript型定義
└── styles/          # グローバルスタイル
```

---

## 🎯 AI推論向け重要ポイント

### コンポーネント実装時の基本パターン
```tsx
// 標準的なコンポーネント構造
import { FC } from 'react';
import { Card, Button } from 'antd';
import useSWR from 'swr';
import { apiClient } from '@/lib/api';

interface Props {
  id: string;
}

export const FeatureComponent: FC<Props> = ({ id }) => {
  const { data, error, isLoading } = useSWR(`/api/items/${id}`, 
    (url) => apiClient.get(url).then(res => res.data)
  );

  if (isLoading) return <Spin />;
  if (error) return <Alert type="error" message="エラー" />;

  return (
    <Card title="タイトル">
      {/* コンテンツ */}
    </Card>
  );
};
```

### 状態管理パターン（Zustand）
```typescript
// src/store/useStore.ts
import { create } from 'zustand';

interface Store {
  count: number;
  increment: () => void;
}

export const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### フォームバリデーション
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('メールアドレス形式が不正です'),
  password: z.string().min(8, '8文字以上必要です'),
});

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: any) => {
    // 送信処理
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
};
```

---

## 🔒 セキュリティベストプラクティス

1. **XSS対策**: Reactのデフォルトエスケープを活用、`dangerouslySetInnerHTML`は最小限に
2. **CSRF対策**: FastAPI側でCSRFトークン実装
3. **認証**: JWTトークンをlocalStorage（XSS対策後）またはhttpOnlyクッキー
4. **入力検証**: Zodスキーマでフロント・バックエンド両方で検証
5. **API通信**: HTTPS必須、CORS適切に設定

---

## 📚 参考リンク

- [Ant Design](https://ant.design/)
- [TanStack Table](https://tanstack.com/table/latest)
- [React Hook Form](https://react-hook-form.com/)
- [SWR](https://swr.vercel.app/)
- [Zustand](https://zustand-demo.pmnd.rs/)

---

**最終更新**: 2024-01
**対象バージョン**: React 18+ / FastAPI 0.100+
