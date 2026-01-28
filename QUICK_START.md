# ひな形クイックスタート（10分で始める）

このガイドは、最速でこのひな形を使って新しいプロジェクトを始めるための簡略版です。

---

## 📦 前提条件

以下がインストールされていることを確認してください：

- Node.js 18以上
- PostgreSQL 13以上
- Git

---

## 🚀 クイックスタート（5ステップ）

### ステップ1: プロジェクトをコピー

```bash
# このリポジトリをクローン
git clone <このリポジトリのURL> my-project
cd my-project

# Gitヒストリーをリセット
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"
```

### ステップ2: データベースを作成

```bash
# PostgreSQLに接続
psql -U postgres

# データベース作成
CREATE DATABASE my_project;
\q

# スキーマを実行
psql -U postgres -d my_project -f backend/migrations/001_initial_schema.sql
```

### ステップ3: 環境変数を設定

**backend/.env** を編集:
```env
PORT=3001
DB_NAME=my_project
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=change_this_secret_key
CORS_ORIGIN=http://localhost:5173
```

### ステップ4: 依存関係をインストール

```bash
# バックエンド
cd backend
npm install

# フロントエンド
cd ../frontend
npm install
```

### ステップ5: 起動

```bash
# バックエンド（ターミナル1）
cd backend
npm run dev

# フロントエンド（ターミナル2）
cd frontend
npm run dev
```

→ ブラウザで `http://localhost:5173` にアクセス

---

## 🎯 次のステップ

### A. そのまま使う場合
- ユーザー登録してログイン
- タスク・課題管理を試す
- カンバン・ガントチャートを確認

### B. カスタマイズする場合
詳細は `TEMPLATE_GUIDE.md` を参照してください。

---

## 📝 よくある質問

### Q: データベース接続エラーが出る
A: PostgreSQLが起動しているか確認。`.env`のパスワードが正しいか確認。

### Q: ポート3001が使用中
A: `.env`の`PORT`を別のポート（例：3002）に変更。

### Q: CORS エラーが出る
A: `backend/.env`の`CORS_ORIGIN`がフロントエンドのURL（通常`http://localhost:5173`）と一致しているか確認。

---

## 🛠️ カスタマイズの基本

新しい機能（例：商品管理）を追加する基本的な流れ：

### 1. データベーステーブルを追加
```sql
-- backend/migrations/ に新しいファイルを作成
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2)
);
```

### 2. モデルを定義（backend/src/models/Product.ts）
```typescript
export interface Product {
  id: number;
  name: string;
  price: number;
}
```

### 3. サービスを実装（backend/src/services/productService.ts）
```typescript
export const productService = {
  async findAll() {
    const result = await pool.query('SELECT * FROM products');
    return result.rows;
  }
};
```

### 4. APIルートを追加（backend/src/api/productRouter.ts）
```typescript
router.get('/', async (req, res) => {
  const products = await productService.findAll();
  res.json(products);
});
```

### 5. フロントエンドで表示（frontend/src/features/products/）
```typescript
// API呼び出し → 状態管理 → コンポーネント表示
```

詳細は `TEMPLATE_GUIDE.md` の「ステップ5〜8」を参照。

---

## 📚 詳細ドキュメント

- **完全ガイド**: `TEMPLATE_GUIDE.md`
- **元の仕様書**: `specs/001-project-tracker/spec.md`（参考用）
- **実装進捗**: `IMPLEMENTATION_PROGRESS.md`

---

**以上でクイックスタート完了です！** 🎉

詳しいカスタマイズ方法は `TEMPLATE_GUIDE.md` を参照してください。
