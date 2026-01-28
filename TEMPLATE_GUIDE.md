# プロジェクト管理アプリ ひな形ガイド

## 📋 目次

1. [ひな形の概要](#ひな形の概要)
2. [ひな形として使える部分](#ひな形として使える部分)
3. [ひな形の使用手順](#ひな形の使用手順)
4. [カスタマイズ方法](#カスタマイズ方法)
5. [技術スタック](#技術スタック)
6. [ディレクトリ構造](#ディレクトリ構造)

---

## ひな形の概要

このプロジェクトは、**GitHub風のプロジェクト&タスク管理システム**をベースとした、フルスタックWebアプリケーションのひな形です。

### ✨ ひな形に含まれる機能

- **認証システム**: JWT認証、ユーザー登録・ログイン
- **データベース基盤**: PostgreSQL + トランザクション管理
- **REST API**: Express.jsベースのRESTful API
- **リアルタイム通信**: Socket.IOによるWebSocket通信
- **フロントエンド**: React + TypeScript + Ant Design
- **状態管理**: Zustand
- **ビジュアライゼーション**: カンバンボード、ガントチャート
- **検索・フィルタ**: 高度な検索・フィルタリング機能

### 🎯 適用可能なプロジェクトタイプ

このひな形は以下のようなプロジェクトに適しています：

- タスク管理システム
- プロジェクト管理ツール
- チケット管理システム
- 顧客管理（CRM）システム
- 在庫管理システム
- ワークフロー管理システム
- その他、CRUD操作 + リアルタイム更新が必要なアプリケーション

---

## ひな形として使える部分

### 🟢 そのまま使える部分（汎用性が高い）

#### 1. **プロジェクト構造全体**
```
├── backend/               # バックエンドコード
│   ├── src/
│   │   ├── api/          # APIルート
│   │   ├── db/           # データベース接続
│   │   ├── middleware/   # 認証・バリデーション
│   │   ├── models/       # データモデル
│   │   ├── services/     # ビジネスロジック
│   │   └── websocket/    # WebSocket処理
│   └── migrations/       # DBマイグレーション
│
├── frontend/             # フロントエンドコード
│   ├── src/
│   │   ├── components/   # 再利用可能なコンポーネント
│   │   ├── features/     # 機能別コンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   ├── layouts/      # レイアウトコンポーネント
│   │   ├── lib/          # API・WebSocketクライアント
│   │   ├── store/        # 状態管理（Zustand）
│   │   └── types/        # TypeScript型定義
│
└── specs/                # 仕様書・設計ドキュメント
```

#### 2. **認証システム（backend/src/middleware/auth.ts）**
- JWT Bearer Token認証
- ユーザー登録・ログイン
- パスワードハッシュ化（bcrypt）
- **使い方**: そのまま利用可能。必要に応じてパスワードポリシーを調整

#### 3. **データベース接続基盤（backend/src/db/）**
- PostgreSQL接続プール管理
- トランザクション処理
- 楽観的ロック（Optimistic Locking）
- エラーハンドリング
- **使い方**: 環境変数を設定するだけで利用可能

#### 4. **APIミドルウェア（backend/src/middleware/）**
- エラーハンドラー
- バリデーションミドルウェア（Zod）
- 認証ミドルウェア
- **使い方**: すべてのAPIで再利用可能

#### 5. **WebSocket基盤（backend/src/websocket/）**
- Socket.IO接続管理
- リアルタイム通知
- 自動再接続ロジック
- **使い方**: イベント名をカスタマイズして利用

#### 6. **フロントエンド共通コンポーネント**
- `frontend/src/components/layout/`: ヘッダー、サイドバー、レイアウト
- `frontend/src/components/common/`: ローディング、エラー表示
- **使い方**: デザインをカスタマイズして利用

#### 7. **API・WebSocketクライアント（frontend/src/lib/）**
- Axios HTTP クライアント設定
- Socket.IO クライアント設定
- 認証トークン管理
- **使い方**: ベースURLを変更するだけで利用可能

#### 8. **状態管理（frontend/src/store/）**
- Zustand ストア構造
- ユーザー認証状態管理
- **使い方**: 新しいストアを追加して拡張可能

#### 9. **TypeScript設定**
- `backend/tsconfig.json`: 厳格なTypeScript設定
- `frontend/tsconfig.json`: React向けTypeScript設定
- **使い方**: そのまま利用可能

#### 10. **開発環境設定**
- ESLint設定
- Prettier設定
- 環境変数管理（.env）
- **使い方**: そのまま利用可能

### 🟡 カスタマイズが必要な部分（ドメイン固有）

#### 1. **データベーススキーマ（backend/migrations/）**
- `schema.sql`: テーブル定義
- **カスタマイズ**: プロジェクトに必要なテーブルに書き換える
- **注意**: users テーブルは認証に必要なので残す

#### 2. **データモデル（backend/src/models/）**
- Task, Issue などのドメインモデル
- **カスタマイズ**: 独自のエンティティに置き換える
- **ひな形**: User モデルは認証で使うので参考にする

#### 3. **サービス層（backend/src/services/）**
- ビジネスロジック実装
- **カスタマイズ**: 独自のビジネスロジックを実装
- **ひな形**: CRUD操作のパターンを参考にする

#### 4. **APIルート（backend/src/api/）**
- RESTful API エンドポイント
- **カスタマイズ**: 独自のエンドポイントを定義
- **ひな形**: authRouter.ts は認証で使うので参考にする

#### 5. **フロントエンドの機能（frontend/src/features/）**
- タスク管理、カンバンボード、ガントチャートなど
- **カスタマイズ**: 必要な機能に置き換える
- **ひな形**: フォーム、リスト、詳細画面のパターンを参考にする

#### 6. **WebSocketイベント（backend/src/websocket/handlers.ts）**
- ドメイン固有のイベント定義
- **カスタマイズ**: 独自のイベントを定義
- **ひな形**: イベント構造を参考にする

### 🔴 削除・置き換えが推奨される部分

#### 1. **仕様書（specs/001-project-tracker/）**
- このプロジェクト固有の仕様書
- **推奨**: 新しいプロジェクトの仕様書を作成

#### 2. **プロジェクト名・説明**
- `package.json` の name, description
- **推奨**: 新しいプロジェクト名に変更

#### 3. **ドメイン固有のビジネスロジック**
- タスク依存関係、循環依存チェックなど
- **推奨**: 必要なければ削除

---

## ひな形の使用手順

### ステップ1: プロジェクトのクローン

```bash
# リポジトリをクローン
git clone <このリポジトリのURL> my-new-project
cd my-new-project

# Gitヒストリーをリセット（新しいプロジェクトとして開始）
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"
```

### ステップ2: プロジェクト名の変更

1. **backend/package.json** を編集:
```json
{
  "name": "my-new-project-backend",
  "description": "My New Project Backend"
}
```

2. **frontend/package.json** を編集:
```json
{
  "name": "my-new-project-frontend",
  "description": "My New Project Frontend"
}
```

3. **README.md** を更新（プロジェクト説明を記述）

### ステップ3: データベース設計

1. **新しいスキーマを設計**:
   - `backend/migrations/001_initial_schema.sql` を編集
   - `users` テーブルは認証に必要なので残す
   - 独自のテーブルを追加

例：
```sql
-- ユーザーテーブルは残す
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 独自のテーブルを追加（例：商品管理の場合）
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INTEGER DEFAULT 0,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **データベースを作成してマイグレーション実行**:
```bash
# PostgreSQLに接続
psql -U postgres

# データベース作成
CREATE DATABASE my_new_project;

# スキーマ実行
psql -U postgres -d my_new_project -f backend/migrations/001_initial_schema.sql
```

### ステップ4: 環境変数の設定

1. **backend/.env** を編集:
```env
# サーバー設定
PORT=3001
NODE_ENV=development

# データベース設定
DB_HOST=localhost
DB_PORT=5432
DB_NAME=my_new_project
DB_USER=postgres
DB_PASSWORD=your_password

# JWT設定（新しいシークレットを生成）
JWT_SECRET=your_new_secret_key_here

# WebSocket設定
WEBSOCKET_PORT=3002

# CORS設定
CORS_ORIGIN=http://localhost:5173
```

2. **frontend/.env** を作成（必要に応じて）:
```env
VITE_API_BASE_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3002
```

### ステップ5: データモデルのカスタマイズ

1. **backend/src/models/** に新しいモデルを作成:

例：`backend/src/models/Product.ts`
```typescript
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  created_by: number;
  created_at: Date;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  stock: number;
}

export interface UpdateProductDTO {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}
```

2. **不要なモデルを削除**:
   - `Task.ts`, `Issue.ts`, `TaskDependency.ts` など

### ステップ6: サービス層の実装

1. **backend/src/services/** に新しいサービスを作成:

例：`backend/src/services/productService.ts`
```typescript
import pool from '../db/pool';
import { Product, CreateProductDTO, UpdateProductDTO } from '../models/Product';

export const productService = {
  async create(userId: number, data: CreateProductDTO): Promise<Product> {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.name, data.description, data.price, data.stock, userId]
    );
    return result.rows[0];
  },

  async findAll(): Promise<Product[]> {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    return result.rows;
  },

  async findById(id: number): Promise<Product | null> {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0] || null;
  },

  async update(id: number, data: UpdateProductDTO): Promise<Product | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.price !== undefined) {
      fields.push(`price = $${paramIndex++}`);
      values.push(data.price);
    }
    if (data.stock !== undefined) {
      fields.push(`stock = $${paramIndex++}`);
      values.push(data.stock);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
    return result.rows[0] || null;
  },

  async delete(id: number): Promise<boolean> {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};
```

### ステップ7: APIルートの実装

1. **backend/src/api/** に新しいルートを作成:

例：`backend/src/api/productRouter.ts`
```typescript
import { Router } from 'express';
import { productService } from '../services/productService';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// バリデーションスキーマ
const createProductSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative()
});

const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional()
});

// すべてのルートで認証が必要
router.use(authenticate);

// GET /api/products - すべての商品を取得
router.get('/', async (req, res, next) => {
  try {
    const products = await productService.findAll();
    res.json(products);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - 特定の商品を取得
router.get('/:id', async (req, res, next) => {
  try {
    const product = await productService.findById(parseInt(req.params.id));
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST /api/products - 商品を作成
router.post('/', validate(createProductSchema), async (req, res, next) => {
  try {
    const product = await productService.create(req.user.id, req.body);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - 商品を更新
router.put('/:id', validate(updateProductSchema), async (req, res, next) => {
  try {
    const product = await productService.update(parseInt(req.params.id), req.body);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - 商品を削除
router.delete('/:id', async (req, res, next) => {
  try {
    const success = await productService.delete(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
```

2. **backend/src/index.ts** にルートを登録:
```typescript
import productRouter from './api/productRouter';

// ... 他のルート登録の後に
app.use('/api/products', productRouter);
```

### ステップ8: フロントエンドの実装

1. **frontend/src/types/** に型定義を追加:

例：`frontend/src/types/product.ts`
```typescript
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  created_by: number;
  created_at: string;
}

export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  stock: number;
}
```

2. **frontend/src/lib/api.ts** に API関数を追加:
```typescript
import axios from 'axios';
import { Product, CreateProductDTO } from '../types/product';

export const productApi = {
  getAll: () => axios.get<Product[]>('/api/products'),
  getById: (id: number) => axios.get<Product>(`/api/products/${id}`),
  create: (data: CreateProductDTO) => axios.post<Product>('/api/products', data),
  update: (id: number, data: Partial<CreateProductDTO>) => 
    axios.put<Product>(`/api/products/${id}`, data),
  delete: (id: number) => axios.delete(`/api/products/${id}`)
};
```

3. **frontend/src/features/** に機能コンポーネントを作成:

例：`frontend/src/features/products/ProductList.tsx`
```typescript
import { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import { productApi } from '../../lib/api';
import { Product } from '../../types/product';

export const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productApi.getAll();
      setProducts(response.data);
    } catch (error) {
      message.error('商品の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '商品名', dataIndex: 'name', key: 'name' },
    { title: '価格', dataIndex: 'price', key: 'price' },
    { title: '在庫', dataIndex: 'stock', key: 'stock' },
  ];

  return (
    <div>
      <h1>商品一覧</h1>
      <Table
        columns={columns}
        dataSource={products}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};
```

### ステップ9: 依存関係のインストールと起動

```bash
# バックエンドの依存関係をインストール
cd backend
npm install

# フロントエンドの依存関係をインストール
cd ../frontend
npm install

# バックエンドを起動（開発モード）
cd ../backend
npm run dev

# 別のターミナルでフロントエンドを起動
cd frontend
npm run dev
```

### ステップ10: 動作確認

1. ブラウザで `http://localhost:5173` にアクセス
2. ユーザー登録・ログイン機能をテスト
3. 作成した新機能（商品管理など）をテスト

---

## カスタマイズ方法

### 1. 認証をカスタマイズする

#### パスワードポリシーを変更
`backend/src/api/authRouter.ts` の登録バリデーションを編集:
```typescript
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(12, 'パスワードは12文字以上必要です')  // 最小長を変更
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, '大文字・小文字・数字を含める必要があります'),
  name: z.string().min(1).max(255)
});
```

#### JWTの有効期限を変更
`backend/src/services/authService.ts`:
```typescript
const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
  expiresIn: '7d'  // 1hから7dに変更
});
```

### 2. WebSocketイベントをカスタマイズする

`backend/src/websocket/handlers.ts`:
```typescript
export const registerWebSocketHandlers = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // カスタムイベントを追加
    socket.on('custom:event', async (data) => {
      // 処理を実装
      io.emit('custom:response', { result: 'success' });
    });
  });
};
```

### 3. UIテーマをカスタマイズする

`frontend/src/App.tsx` でAnt Designのテーマを変更:
```typescript
import { ConfigProvider, theme } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#00b96b',  // プライマリカラーを変更
      borderRadius: 8,
    },
    algorithm: theme.darkAlgorithm,  // ダークモードを有効化
  }}
>
  {/* アプリコンテンツ */}
</ConfigProvider>
```

### 4. 検索・フィルタリングを追加する

バックエンドに検索機能を追加:
```typescript
router.get('/search', authenticate, async (req, res, next) => {
  try {
    const { query, min_price, max_price } = req.query;
    
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (query) {
      sql += ` AND name ILIKE $${paramIndex}`;
      params.push(`%${query}%`);
      paramIndex++;
    }

    if (min_price) {
      sql += ` AND price >= $${paramIndex}`;
      params.push(parseFloat(min_price as string));
      paramIndex++;
    }

    if (max_price) {
      sql += ` AND price <= $${paramIndex}`;
      params.push(parseFloat(max_price as string));
      paramIndex++;
    }

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});
```

---

## 技術スタック

### バックエンド
- **ランタイム**: Node.js 18+
- **言語**: TypeScript
- **フレームワーク**: Express.js
- **データベース**: PostgreSQL
- **認証**: JWT (jsonwebtoken) + bcrypt
- **リアルタイム通信**: Socket.IO
- **バリデーション**: Zod
- **開発ツール**: tsx (開発サーバー), ESLint, Prettier

### フロントエンド
- **ランタイム**: Node.js 18+
- **言語**: TypeScript
- **フレームワーク**: React 18
- **ビルドツール**: Vite
- **UIライブラリ**: Ant Design 5
- **ルーティング**: React Router 6
- **状態管理**: Zustand
- **HTTP通信**: Axios
- **リアルタイム通信**: Socket.IO Client
- **開発ツール**: ESLint, Prettier

### 開発環境
- **OS**: Windows / macOS / Linux
- **エディタ**: VS Code（推奨）
- **バージョン管理**: Git

---

## ディレクトリ構造

### バックエンド詳細
```
backend/
├── src/
│   ├── api/                    # APIルート
│   │   ├── authRouter.ts       # 認証API（ログイン・登録）
│   │   ├── taskRouter.ts       # タスクAPI（例）
│   │   └── [your-router].ts    # 独自のルートを追加
│   │
│   ├── db/                     # データベース関連
│   │   ├── pool.ts             # PostgreSQL接続プール
│   │   ├── queries.ts          # 共通クエリヘルパー
│   │   └── transaction.ts      # トランザクション管理
│   │
│   ├── middleware/             # ミドルウェア
│   │   ├── auth.ts             # JWT認証ミドルウェア
│   │   ├── errorHandler.ts    # エラーハンドラー
│   │   └── validate.ts         # Zodバリデーション
│   │
│   ├── models/                 # データモデル（TypeScript型定義）
│   │   ├── User.ts             # ユーザーモデル
│   │   └── [YourModel].ts      # 独自のモデルを追加
│   │
│   ├── services/               # ビジネスロジック
│   │   ├── authService.ts      # 認証サービス
│   │   └── [yourService].ts    # 独自のサービスを追加
│   │
│   ├── websocket/              # WebSocket処理
│   │   ├── server.ts           # Socket.IOサーバー初期化
│   │   └── handlers.ts         # WebSocketイベントハンドラー
│   │
│   └── index.ts                # エントリーポイント
│
├── migrations/                 # データベースマイグレーション
│   └── 001_initial_schema.sql  # 初期スキーマ
│
├── tests/                      # テストコード
├── .env                        # 環境変数（gitignoreに含む）
├── .env.example                # 環境変数のテンプレート
├── package.json                # 依存関係
└── tsconfig.json               # TypeScript設定
```

### フロントエンド詳細
```
frontend/
├── src/
│   ├── components/             # 再利用可能なコンポーネント
│   │   ├── layout/             # レイアウトコンポーネント
│   │   │   ├── Header.tsx      # ヘッダー
│   │   │   ├── Sidebar.tsx     # サイドバー
│   │   │   └── MainLayout.tsx  # メインレイアウト
│   │   │
│   │   └── common/             # 共通コンポーネント
│   │       ├── Loading.tsx     # ローディング表示
│   │       └── ErrorBoundary.tsx
│   │
│   ├── features/               # 機能別コンポーネント
│   │   ├── auth/               # 認証機能
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   │
│   │   └── [your-feature]/     # 独自の機能を追加
│   │       ├── List.tsx
│   │       ├── Detail.tsx
│   │       └── Form.tsx
│   │
│   ├── hooks/                  # カスタムフック
│   │   ├── useAuth.ts          # 認証フック
│   │   └── useWebSocket.ts     # WebSocketフック
│   │
│   ├── layouts/                # ページレイアウト
│   │   ├── AuthLayout.tsx      # 認証ページレイアウト
│   │   └── DashboardLayout.tsx # ダッシュボードレイアウト
│   │
│   ├── lib/                    # ライブラリ・ユーティリティ
│   │   ├── api.ts              # Axios HTTPクライアント設定
│   │   └── websocket.ts        # Socket.IOクライアント設定
│   │
│   ├── store/                  # Zustand状態管理
│   │   ├── authStore.ts        # 認証状態
│   │   └── [yourStore].ts      # 独自のストアを追加
│   │
│   ├── types/                  # TypeScript型定義
│   │   ├── user.ts
│   │   └── [yourTypes].ts
│   │
│   ├── App.tsx                 # アプリルート
│   └── main.tsx                # エントリーポイント
│
├── public/                     # 静的ファイル
├── index.html                  # HTMLテンプレート
├── package.json                # 依存関係
├── tsconfig.json               # TypeScript設定
└── vite.config.ts              # Vite設定
```

---

## 追加リソース

### 参考ドキュメント
- [Express.js公式ドキュメント](https://expressjs.com/)
- [React公式ドキュメント](https://react.dev/)
- [Ant Design公式ドキュメント](https://ant.design/)
- [Socket.IO公式ドキュメント](https://socket.io/)
- [PostgreSQL公式ドキュメント](https://www.postgresql.org/docs/)
- [Zustand公式ドキュメント](https://github.com/pmndrs/zustand)

### トラブルシューティング

#### データベース接続エラー
```
Error: connection to server failed
```
→ PostgreSQLが起動しているか確認、.envのDB_PASSWORDを確認

#### ポート競合エラー
```
Error: listen EADDRINUSE: address already in use
```
→ .envのPORTを変更、または既存プロセスを終了

#### CORS エラー
```
Access to XMLHttpRequest has been blocked by CORS policy
```
→ backend/.envのCORS_ORIGINを確認、フロントエンドのURLと一致させる

---

## まとめ

このひな形を使用することで、以下のメリットがあります：

✅ **高速な開発開始**: 認証・データベース・APIの基盤が整っている  
✅ **ベストプラクティス**: TypeScript、ESLint、Prettierによる品質保証  
✅ **スケーラブル**: サービス層・モデル層の明確な分離  
✅ **リアルタイム対応**: WebSocket基盤が整備済み  
✅ **モダンなUI**: Ant Designによる洗練されたデザイン  

新しいプロジェクトを始める際は、このガイドに従ってカスタマイズしてください！
