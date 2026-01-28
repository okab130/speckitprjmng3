-- Migration: Add Task Categorization Features
-- Date: 2026-01-27
-- Description: Add functions table, phase, function_id, and assignee_id to tasks

-- 1. Create functions table (3-level function master)
CREATE TABLE IF NOT EXISTS prjmng3.functions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name VARCHAR(100) NOT NULL,
  function_name VARCHAR(100) NOT NULL,
  function_detail VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(system_name, function_name, function_detail)
);

COMMENT ON TABLE prjmng3.functions IS '機能マスタ（3階層: システム名 > 機能名 > 機能詳細）';
COMMENT ON COLUMN prjmng3.functions.system_name IS 'システム名（例: 在庫管理システム）';
COMMENT ON COLUMN prjmng3.functions.function_name IS '機能名（例: マスタ管理）';
COMMENT ON COLUMN prjmng3.functions.function_detail IS '機能詳細（例: 商品マスタ）';

-- 2. Add phase column to tasks
ALTER TABLE prjmng3.tasks 
ADD COLUMN IF NOT EXISTS phase VARCHAR(20);

COMMENT ON COLUMN prjmng3.tasks.phase IS '工程区分（要件定義、設計、製造、テスト、本番移行）';

-- 3. Add function_id column to tasks
ALTER TABLE prjmng3.tasks 
ADD COLUMN IF NOT EXISTS function_id UUID REFERENCES prjmng3.functions(id) ON DELETE SET NULL;

COMMENT ON COLUMN prjmng3.tasks.function_id IS '機能マスタID（NULL可）';

-- 4. Add assignee_id column to tasks
ALTER TABLE prjmng3.tasks 
ADD COLUMN IF NOT EXISTS assignee_id UUID REFERENCES prjmng3.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN prjmng3.tasks.creator_id IS '作成者（タスクの登録者）';
COMMENT ON COLUMN prjmng3.tasks.assignee_id IS '担当者（タスクの実行担当者、NULL可）';

-- 5. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON prjmng3.tasks(phase);
CREATE INDEX IF NOT EXISTS idx_tasks_function_id ON prjmng3.tasks(function_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON prjmng3.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_functions_system_name ON prjmng3.functions(system_name);

-- 6. Insert sample function data
INSERT INTO prjmng3.functions (system_name, function_name, function_detail)
VALUES 
  ('在庫管理システム', 'マスタ管理', '商品マスタ'),
  ('在庫管理システム', 'マスタ管理', '倉庫マスタ'),
  ('在庫管理システム', '入出庫管理', '入庫処理'),
  ('在庫管理システム', '入出庫管理', '出庫処理'),
  ('販売管理システム', '受注管理', '受注登録'),
  ('販売管理システム', '受注管理', '受注照会'),
  ('販売管理システム', '売上管理', '売上計上')
ON CONFLICT (system_name, function_name, function_detail) DO NOTHING;
