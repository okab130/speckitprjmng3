-- Migration: Add Projects Table and Multi-Project Support
-- Date: 2026-02-04
-- Description: Add projects table and project_id to tasks/issues for multi-project management

-- 1. Create projects table
CREATE TABLE IF NOT EXISTS prjmng3.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Archived', 'Completed')),
  created_by UUID REFERENCES prjmng3.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INTEGER DEFAULT 1 NOT NULL
);

COMMENT ON TABLE prjmng3.projects IS 'プロジェクトマスタ（タスク・課題の上位概念）';
COMMENT ON COLUMN prjmng3.projects.name IS 'プロジェクト名';
COMMENT ON COLUMN prjmng3.projects.description IS 'プロジェクト説明';
COMMENT ON COLUMN prjmng3.projects.status IS 'プロジェクト状態（Active: 進行中, Archived: アーカイブ, Completed: 完了）';
COMMENT ON COLUMN prjmng3.projects.created_by IS 'プロジェクト作成者';
COMMENT ON COLUMN prjmng3.projects.version IS '楽観的ロック用バージョン';

-- 2. Add project_id to tasks table
ALTER TABLE prjmng3.tasks 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES prjmng3.projects(id) ON DELETE CASCADE;

COMMENT ON COLUMN prjmng3.tasks.project_id IS '所属プロジェクトID（NULL可: 既存データとの互換性のため）';

-- 3. Add project_id to issues table
ALTER TABLE prjmng3.issues 
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES prjmng3.projects(id) ON DELETE CASCADE;

COMMENT ON COLUMN prjmng3.issues.project_id IS '所属プロジェクトID（NULL可: 既存データとの互換性のため）';

-- 4. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON prjmng3.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON prjmng3.projects(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON prjmng3.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_issues_project_id ON prjmng3.issues(project_id);

-- 5. Create trigger for updated_at
CREATE OR REPLACE FUNCTION prjmng3.update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON prjmng3.projects
  FOR EACH ROW
  EXECUTE FUNCTION prjmng3.update_projects_updated_at();

-- 6. Insert default project for existing data
INSERT INTO prjmng3.projects (id, name, description, status)
VALUES ('00000000-0000-0000-0000-000000000001', 'デフォルトプロジェクト', '既存のタスクと課題用のデフォルトプロジェクト', 'Active')
ON CONFLICT (id) DO NOTHING;

-- 7. Update existing tasks and issues to belong to default project
UPDATE prjmng3.tasks 
SET project_id = '00000000-0000-0000-0000-000000000001'
WHERE project_id IS NULL;

UPDATE prjmng3.issues 
SET project_id = '00000000-0000-0000-0000-000000000001'
WHERE project_id IS NULL;
