-- Database Schema: Project & Task Management System
-- Schema: prjmng3
-- Date: 2025-01-26

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable trigram index for search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS prjmng3.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Index for login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON prjmng3.users(email);

-- 2. Tasks Table
CREATE TABLE IF NOT EXISTS prjmng3.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'To Do' NOT NULL,
  creator_id UUID NOT NULL REFERENCES prjmng3.users(id) ON DELETE CASCADE,
  start_date DATE,
  end_date DATE,
  version INTEGER DEFAULT 1 NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_status CHECK (status IN ('To Do', 'In Progress', 'Complete')),
  CONSTRAINT valid_date_range CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_creator ON prjmng3.tasks(creator_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON prjmng3.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON prjmng3.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_version ON prjmng3.tasks(id, version); -- Optimistic locking

-- Trigram indexes for search
CREATE INDEX IF NOT EXISTS idx_tasks_title_trgm ON prjmng3.tasks USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_tasks_description_trgm ON prjmng3.tasks USING gin(description gin_trgm_ops);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION prjmng3.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at_trigger ON prjmng3.tasks;
CREATE TRIGGER tasks_updated_at_trigger
BEFORE UPDATE ON prjmng3.tasks
FOR EACH ROW
EXECUTE FUNCTION prjmng3.update_updated_at_column();

-- 3. Issues Table
CREATE TABLE IF NOT EXISTS prjmng3.issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Open' NOT NULL,
  severity VARCHAR(50) DEFAULT 'Medium' NOT NULL,
  creator_id UUID NOT NULL REFERENCES prjmng3.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  
  CONSTRAINT valid_issue_status CHECK (status IN ('Open', 'Resolved')),
  CONSTRAINT valid_severity CHECK (severity IN ('Low', 'Medium', 'High'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_issues_creator ON prjmng3.issues(creator_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON prjmng3.issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_severity ON prjmng3.issues(severity);
CREATE INDEX IF NOT EXISTS idx_issues_created_at ON prjmng3.issues(created_at DESC);

-- 4. Task Dependencies Table
CREATE TABLE IF NOT EXISTS prjmng3.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_task_id UUID NOT NULL REFERENCES prjmng3.tasks(id) ON DELETE CASCADE,
  to_task_id UUID NOT NULL REFERENCES prjmng3.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT no_self_dependency CHECK (from_task_id <> to_task_id),
  CONSTRAINT unique_dependency UNIQUE (from_task_id, to_task_id)
);

-- Indexes for dependency queries
CREATE INDEX IF NOT EXISTS idx_dependencies_from ON prjmng3.task_dependencies(from_task_id);
CREATE INDEX IF NOT EXISTS idx_dependencies_to ON prjmng3.task_dependencies(to_task_id);

-- 5. Task-Issue Links Table
CREATE TABLE IF NOT EXISTS prjmng3.task_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES prjmng3.tasks(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES prjmng3.issues(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_task_issue_link UNIQUE (task_id, issue_id)
);

-- Indexes for bidirectional lookups
CREATE INDEX IF NOT EXISTS idx_task_issues_task ON prjmng3.task_issues(task_id);
CREATE INDEX IF NOT EXISTS idx_task_issues_issue ON prjmng3.task_issues(issue_id);
