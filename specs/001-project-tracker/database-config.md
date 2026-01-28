# データベース接続情報

## 環境
- PostgreSQL
- ローカルDocker
- コンテナ名: `db`
- スキーマ作成済: `prjmng3`

## 接続情報
```
Host: localhost
Port: 5432
Database: postgres
User: postgres
Password: pass
Schema: prjmng3
```

## 接続文字列例
```
postgresql://postgres:pass@localhost:5432/postgres?currentSchema=prjmng3
```

## 注意事項
- スキーマ `prjmng3` は既に作成済
- テーブル設計は実装計画フェーズで定義
- Docker コンテナ `db` が起動していることを前提
