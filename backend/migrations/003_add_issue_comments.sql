-- Migration: Add issue_comments table
-- Date: 2026-01-27
-- Description: Add table to track issue response history

-- Create issue_comments table
CREATE TABLE IF NOT EXISTS prjmng3.issue_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES prjmng3.issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES prjmng3.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT issue_comments_content_not_empty CHECK (length(trim(content)) > 0)
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON prjmng3.issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user_id ON prjmng3.issue_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_created_at ON prjmng3.issue_comments(created_at DESC);

-- Add comments
COMMENT ON TABLE prjmng3.issue_comments IS '課題の対応履歴コメント';
COMMENT ON COLUMN prjmng3.issue_comments.id IS 'コメントID';
COMMENT ON COLUMN prjmng3.issue_comments.issue_id IS '課題ID';
COMMENT ON COLUMN prjmng3.issue_comments.user_id IS '対応者（コメント投稿者）';
COMMENT ON COLUMN prjmng3.issue_comments.content IS '対応内容';
COMMENT ON COLUMN prjmng3.issue_comments.created_at IS '対応日時';
COMMENT ON COLUMN prjmng3.issue_comments.updated_at IS '更新日時';
