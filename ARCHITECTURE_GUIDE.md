# ひな形アーキテクチャ図解

このドキュメントでは、プロジェクト管理アプリのひな形の構造を視覚的に説明します。

---

## 📐 システム全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                        ユーザー                               │
└────────────────────┬────────────────────────────────────────┘
                     │ ブラウザ
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   フロントエンド (React)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │  UIコンポーネント │  │ 状態管理      │  │ API/WebSocket  │   │
│  │  (Ant Design) │  │  (Zustand)   │  │  クライアント    │   │
│  └──────────────┘  └──────────────┘  └─────────────────┘   │
│                      Port: 5173 (開発)                       │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP + WebSocket
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  バックエンド (Express)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │ REST API     │  │ WebSocket    │  │ 認証             │   │
│  │ エンドポイント │  │ ハンドラー    │  │ (JWT)           │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬────────┘   │
│         └──────────────────┴──────────────────┘            │
│                           │                                 │
│                 ┌─────────▼─────────┐                       │
│                 │  ビジネスロジック    │                       │
│                 │  (Services)       │                       │
│                 └─────────┬─────────┘                       │
│                      Port: 3001                             │
└───────────────────────────┬─────────────────────────────────┘
                            │ SQL
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   データベース (PostgreSQL)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  users   │  │  tasks   │  │  issues  │  │  ...     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                      Port: 5432                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 フロントエンド構造

```
frontend/src/
│
├─ App.tsx (ルート)
│   │
│   ├─ 認証チェック
│   ├─ ルーティング設定
│   └─ テーマ設定
│
├─ features/ (機能別コンポーネント)
│   │
│   ├─ auth/                  🔐 認証機能
│   │   ├─ Login.tsx              ログイン画面
│   │   └─ Register.tsx           登録画面
│   │
│   ├─ tasks/                 📋 タスク管理
│   │   ├─ TaskList.tsx           タスク一覧
│   │   ├─ TaskForm.tsx           タスク作成/編集
│   │   └─ TaskDetail.tsx         タスク詳細
│   │
│   ├─ kanban/                📊 カンバンボード
│   │   └─ KanbanBoard.tsx        ドラッグ&ドロップボード
│   │
│   └─ gantt/                 📅 ガントチャート
│       └─ GanttChart.tsx         タイムライン表示
│
├─ components/ (再利用可能なコンポーネント)
│   │
│   ├─ layout/                🏗️ レイアウト
│   │   ├─ Header.tsx             ヘッダー（ロゴ、ユーザーメニュー）
│   │   ├─ Sidebar.tsx            サイドバー（ナビゲーション）
│   │   └─ MainLayout.tsx         メインレイアウト（ヘッダー+サイドバー+コンテンツ）
│   │
│   └─ common/                🔧 共通コンポーネント
│       ├─ Loading.tsx            ローディングスピナー
│       └─ ErrorBoundary.tsx      エラーハンドリング
│
├─ store/ (状態管理)
│   │
│   ├─ authStore.ts           🔑 ユーザー認証状態
│   │   ├─ user情報
│   │   ├─ token
│   │   ├─ login()
│   │   └─ logout()
│   │
│   └─ [yourStore].ts         ➕ カスタムストア追加可能
│
├─ lib/ (ライブラリ設定)
│   │
│   ├─ api.ts                 🌐 HTTP通信
│   │   ├─ Axios設定
│   │   ├─ 認証ヘッダー自動付与
│   │   └─ エラーハンドリング
│   │
│   └─ websocket.ts           ⚡ リアルタイム通信
│       ├─ Socket.IO設定
│       ├─ 自動再接続
│       └─ イベントリスナー
│
├─ hooks/ (カスタムフック)
│   │
│   ├─ useAuth.ts             🔐 認証フック
│   └─ useWebSocket.ts        ⚡ WebSocketフック
│
└─ types/ (型定義)
    │
    ├─ user.ts
    ├─ task.ts
    └─ [yourTypes].ts
```

---

## ⚙️ バックエンド構造

```
backend/src/
│
├─ index.ts (エントリーポイント)
│   │
│   ├─ Express初期化
│   ├─ ミドルウェア設定
│   ├─ ルート登録
│   └─ WebSocketサーバー起動
│
├─ api/ (APIルート)
│   │
│   ├─ authRouter.ts          🔐 認証API
│   │   ├─ POST /api/auth/register  登録
│   │   └─ POST /api/auth/login     ログイン
│   │
│   ├─ taskRouter.ts          📋 タスクAPI
│   │   ├─ GET    /api/tasks        一覧取得
│   │   ├─ GET    /api/tasks/:id    詳細取得
│   │   ├─ POST   /api/tasks        作成
│   │   ├─ PUT    /api/tasks/:id    更新
│   │   └─ DELETE /api/tasks/:id    削除
│   │
│   └─ [yourRouter].ts        ➕ カスタムルート追加可能
│
├─ services/ (ビジネスロジック)
│   │
│   ├─ authService.ts         🔑 認証処理
│   │   ├─ register()            パスワードハッシュ化
│   │   ├─ login()               認証+JWT発行
│   │   └─ validateToken()       トークン検証
│   │
│   ├─ taskService.ts         📋 タスク処理
│   │   ├─ create()              タスク作成
│   │   ├─ findAll()             一覧取得
│   │   ├─ findById()            詳細取得
│   │   ├─ update()              更新
│   │   └─ delete()              削除
│   │
│   └─ [yourService].ts       ➕ カスタムサービス追加可能
│
├─ middleware/ (ミドルウェア)
│   │
│   ├─ auth.ts                🔐 JWT認証
│   │   └─ authenticate()        トークン検証+ユーザー情報抽出
│   │
│   ├─ validate.ts            ✅ バリデーション
│   │   └─ validate(schema)      Zodスキーマで検証
│   │
│   └─ errorHandler.ts        ❌ エラーハンドリング
│       └─ 統一フォーマットでエラー返却
│
├─ db/ (データベース)
│   │
│   ├─ pool.ts                🔌 接続プール
│   │   └─ PostgreSQL接続設定
│   │
│   ├─ queries.ts             📝 クエリヘルパー
│   │   └─ 共通クエリ関数
│   │
│   └─ transaction.ts         🔄 トランザクション
│       └─ BEGIN/COMMIT/ROLLBACK管理
│
├─ websocket/ (リアルタイム通信)
│   │
│   ├─ server.ts              ⚡ Socket.IOサーバー
│   │   └─ WebSocket初期化
│   │
│   └─ handlers.ts            📡 イベントハンドラー
│       ├─ connection            接続イベント
│       ├─ disconnect            切断イベント
│       └─ [custom events]       カスタムイベント
│
└─ models/ (データモデル)
    │
    ├─ User.ts                👤 ユーザーモデル
    ├─ Task.ts                📋 タスクモデル
    └─ [YourModel].ts         ➕ カスタムモデル追加可能
```

---

## 🔄 リクエストフロー（例：タスク作成）

```
【フロントエンド】
  1. ユーザーがフォーム送信
     TaskForm.tsx
         ↓
  2. APIクライアント呼び出し
     api.ts → POST /api/tasks
         ↓
         HTTP Request
         ↓
【バックエンド】
  3. ルートで受信
     taskRouter.ts
         ↓
  4. 認証ミドルウェア
     authenticate() → JWTトークン検証
         ↓
  5. バリデーションミドルウェア
     validate() → Zodスキーマ検証
         ↓
  6. サービス層
     taskService.create()
         ↓
  7. データベース
     INSERT INTO tasks ...
         ↓
  8. レスポンス返却
     201 Created + タスクデータ
         ↓
         HTTP Response
         ↓
【フロントエンド】
  9. レスポンス処理
     状態更新 → UI再レンダリング
         ↓
  10. 成功メッセージ表示
      message.success('タスクを作成しました')
```

---

## ⚡ WebSocketフロー（例：リアルタイム更新）

```
【ユーザーA】                    【サーバー】                 【ユーザーB】
    │                               │                           │
    │  1. タスク更新                   │                           │
    │  PUT /api/tasks/123           │                           │
    ├──────────────────────────────►│                           │
    │                               │                           │
    │  2. DB更新                      │                           │
    │                               │ UPDATE tasks              │
    │                               │                           │
    │  3. WebSocketで通知送信         │                           │
    │                               ├──────────────────────────►│
    │                               │ emit('task:updated')      │
    │                               │                           │
    │                               │                           │ 4. UIを自動更新
    │                               │                           │
    │◄──────────────────────────────┤                           │
    │  5. 自分も更新通知を受信         │                           │
    │  emit('task:updated')         │                           │
    │                               │                           │
    └───────────────────────────────┴───────────────────────────┘
```

---

## 🗄️ データベーススキーマ（主要テーブル）

```sql
┌─────────────────────────────────────┐
│ users (ユーザー)                      │
├─────────────────────────────────────┤
│ id               SERIAL PRIMARY KEY │  ← 認証に必須（削除不可）
│ name             VARCHAR(255)       │
│ email            VARCHAR(255) UNIQUE│
│ password_hash    VARCHAR(255)       │
│ created_at       TIMESTAMP          │
└─────────────────────────────────────┘
                  │
                  │ 1
                  │
                  │ N
                  ▼
┌─────────────────────────────────────┐
│ tasks (タスク) ※カスタマイズ対象       │
├─────────────────────────────────────┤
│ id               SERIAL PRIMARY KEY │
│ title            VARCHAR(255)       │
│ description      TEXT               │
│ status           VARCHAR(50)        │
│ start_date       DATE               │
│ end_date         DATE               │
│ created_by       INTEGER FK → users │
│ created_at       TIMESTAMP          │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [your_table] (独自テーブル)          │
├─────────────────────────────────────┤
│ id               SERIAL PRIMARY KEY │
│ [your_columns]   ...                │
│ created_by       INTEGER FK → users │  ← ユーザーと関連付け
│ created_at       TIMESTAMP          │
└─────────────────────────────────────┘
```

---

## 🔐 認証フロー

```
【新規登録】
  1. ユーザーがフォーム入力（email, password, name）
      ↓
  2. POST /api/auth/register
      ↓
  3. パスワードハッシュ化（bcrypt）
      ↓
  4. usersテーブルにINSERT
      ↓
  5. JWT生成（ユーザーID含む）
      ↓
  6. トークン返却
      ↓
  7. フロントエンドでトークン保存（Zustand + localStorage）

【ログイン】
  1. ユーザーがフォーム入力（email, password）
      ↓
  2. POST /api/auth/login
      ↓
  3. emailでユーザー検索
      ↓
  4. パスワード検証（bcrypt.compare）
      ↓
  5. JWT生成
      ↓
  6. トークン返却
      ↓
  7. フロントエンドでトークン保存

【認証必須API呼び出し】
  1. APIリクエスト
     Header: Authorization: Bearer <token>
      ↓
  2. authenticate()ミドルウェア
      ↓
  3. トークン検証（jwt.verify）
      ↓
  4. ユーザー情報をreq.userに設定
      ↓
  5. 次のミドルウェア/ルートハンドラーへ
```

---

## 📦 ひな形のカスタマイズポイント

### 🟢 そのまま使える（変更不要）

```
✅ backend/src/middleware/    認証・バリデーション
✅ backend/src/db/            データベース接続
✅ backend/src/websocket/     WebSocket基盤
✅ frontend/src/lib/          API・WebSocketクライアント
✅ frontend/src/store/        状態管理の構造
✅ frontend/src/components/layout/  レイアウト
✅ 設定ファイル（tsconfig, eslint, prettier）
```

### 🟡 カスタマイズが必要

```
📝 backend/migrations/        データベーススキーマ
📝 backend/src/models/        データモデル
📝 backend/src/services/      ビジネスロジック
📝 backend/src/api/           APIルート
📝 frontend/src/features/     機能コンポーネント
📝 frontend/src/types/        型定義
📝 package.json (name, description)
```

### 🔴 削除推奨

```
❌ specs/001-project-tracker/  元の仕様書（参考用）
❌ ドメイン固有のビジネスロジック（タスク依存関係など）
```

---

## 🛠️ カスタマイズの基本パターン

### パターン1: 新しいエンティティを追加

```
1. データベース      migrations/002_add_products.sql
2. モデル定義        models/Product.ts
3. サービス実装      services/productService.ts
4. APIルート         api/productRouter.ts
5. 型定義            frontend/types/product.ts
6. API関数           frontend/lib/api.ts
7. コンポーネント     frontend/features/products/
```

### パターン2: 既存の機能を変更

```
1. データベーススキーマ変更    migrations/
2. モデル変更                models/
3. サービスロジック変更       services/
4. APIレスポンス変更          api/
5. フロントエンド型変更       types/
6. UI変更                    features/
```

### パターン3: 新しいWebSocketイベント追加

```
1. バックエンド       websocket/handlers.ts
   socket.on('custom:event', handler)
   
2. フロントエンド     lib/websocket.ts
   socket.on('custom:event', callback)
   
3. コンポーネント     features/
   useWebSocket('custom:event')
```

---

## 📊 ひな形の利用シーン別ガイド

### シーン1: タスク管理系アプリ
→ **そのまま使える！** 既存のTask/Issue構造を活用

### シーン2: 顧客管理（CRM）
→ **カスタマイズ**: Task → Customer, Issue → SupportTicket

### シーン3: 在庫管理
→ **カスタマイズ**: Task → Product, Issue → StockAlert

### シーン4: プロジェクト管理
→ **そのまま使える！** または機能を追加

### シーン5: チケット管理
→ **軽微なカスタマイズ**: Task → Ticket, ステータスをカスタマイズ

---

## 🎓 学習パス（初心者向け）

### Phase 1: ひな形を理解する（1-2日）
1. `QUICK_START.md` でアプリを起動
2. ユーザー登録・ログイン機能を試す
3. タスク作成・更新・削除を試す
4. カンバンボード、ガントチャートを操作

### Phase 2: コードを読む（2-3日）
1. バックエンドのauthRouter.tsを読む
2. フロントエンドのLogin.tsxを読む
3. データフロー（API→Service→DB）を追跡
4. WebSocketの動作を確認

### Phase 3: 小さな変更をする（3-5日）
1. 新しいフィールドを追加（例：タスクに優先度）
2. 新しいステータスを追加
3. UIの文言を変更
4. バリデーションルールを変更

### Phase 4: 新機能を追加する（1週間）
1. 新しいテーブルを追加（例：products）
2. CRUD APIを実装
3. フロントエンドで一覧・作成・編集画面を作成
4. リアルタイム更新を実装

### Phase 5: 独自アプリを開発（2週間〜）
1. 要件定義
2. データベース設計
3. バックエンド実装
4. フロントエンド実装
5. テスト・デプロイ

---

## 🔍 コードリーディングガイド

### 認証の仕組みを理解したい
→ 読むべきファイル:
- `backend/src/api/authRouter.ts`
- `backend/src/services/authService.ts`
- `backend/src/middleware/auth.ts`
- `frontend/src/features/auth/Login.tsx`
- `frontend/src/store/authStore.ts`

### APIの仕組みを理解したい
→ 読むべきファイル:
- `backend/src/api/taskRouter.ts`
- `backend/src/services/taskService.ts`
- `backend/src/middleware/validate.ts`
- `frontend/src/lib/api.ts`

### WebSocketの仕組みを理解したい
→ 読むべきファイル:
- `backend/src/websocket/server.ts`
- `backend/src/websocket/handlers.ts`
- `frontend/src/lib/websocket.ts`
- `frontend/src/hooks/useWebSocket.ts`

### データベースの仕組みを理解したい
→ 読むべきファイル:
- `backend/src/db/pool.ts`
- `backend/src/db/transaction.ts`
- `backend/migrations/001_initial_schema.sql`

---

## まとめ

このひな形は、**モダンなフルスタックWebアプリケーション**の基盤を提供します。

- 🏗️ **構造が整理されている**: 保守性・拡張性が高い
- 🔐 **認証が実装済み**: すぐに使える
- ⚡ **リアルタイム対応**: WebSocketが組み込み済み
- 📱 **モダンなUI**: Ant Designで洗練されたデザイン
- 🛠️ **カスタマイズ容易**: 明確なレイヤー分離

新しいプロジェクトを始める際の強力な土台として活用してください！
