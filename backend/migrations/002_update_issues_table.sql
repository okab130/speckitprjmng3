-- Migration: Update issues table for Kanban/Gantt integration
-- Adds due_date and updates status values

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add due_date column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'prjmng3' 
        AND table_name = 'issues' 
        AND column_name = 'due_date'
    ) THEN
        ALTER TABLE prjmng3.issues ADD COLUMN due_date TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update the check constraint for status FIRST
ALTER TABLE prjmng3.issues DROP CONSTRAINT IF EXISTS issues_status_check;
ALTER TABLE prjmng3.issues DROP CONSTRAINT IF EXISTS valid_issue_status;

-- Update status values from Open/Resolved to To Do/In Progress/Complete
-- This migration preserves data by mapping:
-- 'Open' -> 'To Do'
-- 'Resolved' -> 'Complete'
UPDATE prjmng3.issues SET status = 'To Do' WHERE status = 'Open';
UPDATE prjmng3.issues SET status = 'Complete' WHERE status = 'Resolved';

-- Add the new check constraint
ALTER TABLE prjmng3.issues ADD CONSTRAINT issues_status_check 
    CHECK (status IN ('To Do', 'In Progress', 'Complete'));

-- Create index on due_date for Gantt chart queries
CREATE INDEX IF NOT EXISTS idx_issues_due_date ON prjmng3.issues(due_date);

-- Add comment
COMMENT ON COLUMN prjmng3.issues.due_date IS 'Expected completion date for the issue';

