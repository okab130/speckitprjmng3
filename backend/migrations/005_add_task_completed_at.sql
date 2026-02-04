-- Migration: Add completed_at to tasks
-- Date: 2026-02-04
-- Description: Add completed_at timestamp to track actual task completion date

-- Add completed_at column to tasks
ALTER TABLE prjmng3.tasks 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP;

COMMENT ON COLUMN prjmng3.tasks.completed_at IS 'タスクの実際の完了日時（statusがCompleteになった日時）';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON prjmng3.tasks(completed_at);

-- Update existing completed tasks to set completed_at = updated_at
UPDATE prjmng3.tasks 
SET completed_at = updated_at 
WHERE status = 'Complete' AND completed_at IS NULL;
