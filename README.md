# プロジェクト管理アプリ - テンプレート/ひな形

このリポジトリは、**フルスタックWebアプリケーションのひな形（テンプレート）**として設計されています。

GitHub風のプロジェクト&タスク管理システムをベースに、認証、データベース、リアルタイム通信などの基盤が整備されており、様々なタイプのWebアプリケーションに応用できます。

---

## 🚀 クイックスタート（5分）

```bash
# 1. クローン
git clone <このリポジトリのURL> my-project
cd my-project

# 2. データベース作成
psql -U postgres
CREATE DATABASE my_project;
\q
psql -U postgres -d my_project -f backend/migrations/001_initial_schema.sql

# 3. 環境変数設定（backend/.envを編集）
cd backend
cp .env.example .env
# DB_NAME, DB_PASSWORD, JWT_SECRET を編集

# 4. 依存関係インストール
npm install
cd ../frontend
npm install

# 5. 起動
cd ../backend && npm run dev    # ターミナル1
cd frontend && npm run dev      # ターミナル2
```

→ ブラウザで `http://localhost:5173` にアクセス

詳細は **[QUICK_START.md](./QUICK_START.md)** を参照してください。

---

## 📚 ドキュメント

このひな形を使用するための包括的なドキュメントを用意しています：

### 1. 📖 [TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md) - **完全ガイド**
- ひな形の概要と適用可能なプロジェクト
- そのまま使える部分 vs カスタマイズが必要な部分
- 詳細なカスタマイズ手順（ステップバイステップ）
- 技術スタックとディレクトリ構造の説明

### 2. ⚡ [QUICK_START.md](./QUICK_START.md) - **クイックスタート**
- 10分で始めるための最短手順
- よくある質問とトラブルシューティング
- カスタマイズの基本フロー

### 3. 🏗️ [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md) - **アーキテクチャ図解**
- システム全体の構成図
- フロントエンド・バックエンドの構造
- リクエストフロー・WebSocketフローの図解
- データベーススキーマの説明
- カスタマイズポイントの視覚化

### 4. ✅ [CUSTOMIZATION_CHECKLIST.md](./CUSTOMIZATION_CHECKLIST.md) - **カスタマイズチェックリスト**
- 作業の進捗管理に使えるチェックリスト
- セットアップからデプロイまでの全工程
- 漏れなく作業を進めるためのガイド

---

## ✨ ひな形に含まれる機能

このひな形には、以下の機能がすぐに使える状態で含まれています：

### 🔐 認証システム
- ユーザー登録・ログイン
- JWT認証（Bearer Token）
- パスワードハッシュ化（bcrypt）

### 🗄️ データベース基盤
- PostgreSQL接続プール管理
- トランザクション処理
- 楽観的ロック（Optimistic Locking）
- エラーハンドリング

### 🌐 REST API
- Express.jsベースのRESTful API
- 認証ミドルウェア
- バリデーションミドルウェア（Zod）
- エラーハンドラー

### ⚡ リアルタイム通信
- Socket.IOによるWebSocket通信
- 自動再接続ロジック
- リアルタイム更新通知

### 🎨 フロントエンド
- React 18 + TypeScript
- Ant Design 5（UIコンポーネント）
- Zustand（状態管理）
- React Router 6（ルーティング）
- Axios（HTTP通信）

### 🛠️ 開発環境
- TypeScript設定（厳格モード）
- ESLint + Prettier
- 開発サーバー（ホットリロード）

---

## 🎯 適用可能なプロジェクト

このひな形は以下のようなプロジェクトに適しています：

- ✅ タスク管理システム
- ✅ プロジェクト管理ツール
- ✅ チケット管理システム
- ✅ 顧客管理（CRM）システム
- ✅ 在庫管理システム
- ✅ ワークフロー管理システム
- ✅ その他、CRUD操作 + リアルタイム更新が必要なアプリ

---

## 📂 プロジェクト構造

```
├── backend/               # バックエンド（Node.js + Express + TypeScript）
│   ├── src/
│   │   ├── api/          # APIルート
│   │   ├── db/           # データベース接続
│   │   ├── middleware/   # 認証・バリデーション
│   │   ├── models/       # データモデル
│   │   ├── services/     # ビジネスロジック
│   │   └── websocket/    # WebSocket処理
│   └── migrations/       # データベースマイグレーション
│
├── frontend/             # フロントエンド（React + TypeScript + Vite）
│   ├── src/
│   │   ├── components/   # 再利用可能なコンポーネント
│   │   ├── features/     # 機能別コンポーネント
│   │   ├── hooks/        # カスタムフック
│   │   ├── lib/          # API・WebSocketクライアント
│   │   ├── store/        # 状態管理（Zustand）
│   │   └── types/        # TypeScript型定義
│
└── specs/                # 仕様書・設計ドキュメント（参考用）
```

---

## 🔧 技術スタック

### バックエンド
- **ランタイム**: Node.js 18+
- **言語**: TypeScript
- **フレームワーク**: Express.js
- **データベース**: PostgreSQL
- **認証**: JWT (jsonwebtoken) + bcrypt
- **リアルタイム通信**: Socket.IO
- **バリデーション**: Zod

### フロントエンド
- **言語**: TypeScript
- **フレームワーク**: React 18
- **ビルドツール**: Vite
- **UIライブラリ**: Ant Design 5
- **ルーティング**: React Router 6
- **状態管理**: Zustand
- **HTTP通信**: Axios
- **リアルタイム通信**: Socket.IO Client

---

## 🛠️ カスタマイズの流れ

1. **データベース設計**: 必要なテーブルを定義
2. **バックエンド実装**: モデル → サービス → API
3. **フロントエンド実装**: 型定義 → API関数 → コンポーネント
4. **テスト**: 動作確認とテスト
5. **デプロイ**: 本番環境へのデプロイ

詳細は **[TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md)** の「ステップ3〜9」を参照してください。

---

## 📖 使い方の例

### 例1: 商品管理システムを作る

```
1. データベース: products テーブルを追加
2. バックエンド: Product モデル、productService、productRouter を実装
3. フロントエンド: ProductList, ProductForm コンポーネントを作成
4. WebSocket: product:created, product:updated イベントを追加
```

### 例2: 顧客管理（CRM）システムを作る

```
1. データベース: customers, contacts テーブルを追加
2. バックエンド: Customer, Contact モデル、サービス、APIを実装
3. フロントエンド: CustomerList, CustomerDetail, ContactForm を作成
4. WebSocket: customer:updated イベントを追加
```

詳細な手順は **[TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md)** の「ステップ5〜8」を参照してください。

---

## 🟢 そのまま使える部分

以下の部分は変更せずにそのまま使用できます：

- ✅ 認証システム（JWT認証、ユーザー登録・ログイン）
- ✅ データベース接続基盤
- ✅ APIミドルウェア（認証、バリデーション、エラーハンドリング）
- ✅ WebSocket基盤
- ✅ フロントエンドのレイアウトコンポーネント
- ✅ API・WebSocketクライアント設定
- ✅ 状態管理の構造（Zustand）
- ✅ TypeScript、ESLint、Prettier設定

---

## 🟡 カスタマイズが必要な部分

以下の部分は、プロジェクトに応じてカスタマイズしてください：

- 📝 データベーススキーマ（テーブル定義）
- 📝 データモデル（TypeScript型定義）
- 📝 ビジネスロジック（サービス層）
- 📝 APIルート（エンドポイント定義）
- 📝 フロントエンドの機能コンポーネント
- 📝 WebSocketイベント

詳細は **[TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md)** の「ひな形として使える部分」セクションを参照してください。

---

## 🚨 トラブルシューティング

### データベース接続エラー
```
Error: connection to server failed
```
→ PostgreSQLが起動しているか確認。`.env`の`DB_PASSWORD`を確認。

### ポート競合エラー
```
Error: listen EADDRINUSE: address already in use
```
→ `.env`の`PORT`を変更、または既存プロセスを終了。

### CORS エラー
```
Access to XMLHttpRequest has been blocked by CORS policy
```
→ `backend/.env`の`CORS_ORIGIN`がフロントエンドのURLと一致しているか確認。

詳細は **[QUICK_START.md](./QUICK_START.md)** の「よくある質問」を参照してください。

---

## 📊 元のアプリケーション（参考）

このひな形は、以下の機能を持つプロジェクト管理アプリをベースにしています：

- タスク管理（作成・更新・削除）
- 課題管理（Issue tracking）
- カンバンボード（ドラッグ&ドロップ）
- ガントチャート（タイムライン表示）
- リアルタイム同期
- 検索・フィルタリング

元の仕様書は `specs/001-project-tracker/spec.md` にあります（参考用）。

---

## 📄 ライセンス

MIT License

このひな形は自由に使用・改変・配布できます。

---

## 🤝 コントリビューション

改善提案やバグ報告は Issue または Pull Request でお願いします。

---

## 📞 サポート

質問や問題がある場合は、以下のドキュメントを参照してください：

1. **[QUICK_START.md](./QUICK_START.md)** - 基本的な使い方
2. **[TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md)** - 詳細なカスタマイズ方法
3. **[ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md)** - アーキテクチャの理解
4. **[CUSTOMIZATION_CHECKLIST.md](./CUSTOMIZATION_CHECKLIST.md)** - 作業チェックリスト

---

## 🎉 始めましょう！

新しいプロジェクトを始めるには：

1. **[QUICK_START.md](./QUICK_START.md)** でアプリを起動
2. **[TEMPLATE_GUIDE.md](./TEMPLATE_GUIDE.md)** でカスタマイズ方法を学ぶ
3. **[CUSTOMIZATION_CHECKLIST.md](./CUSTOMIZATION_CHECKLIST.md)** で作業を管理

**Happy Coding!** 🚀
