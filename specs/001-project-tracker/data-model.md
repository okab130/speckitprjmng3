# Data Model: Project & Task Management System

**Branch**: `001-project-tracker` | **Date**: 2025-01-26  
**Phase**: Phase 1 - Design Artifacts

---

## Entity-Relationship Overview

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Task     │       │    Issue    │
│             │───────│             │───────│             │
│ id (PK)     │ 1   ∞ │ id (PK)     │ 1   ∞ │ id (PK)     │
│ email       │       │ title       │       │ description │
│ password    │       │ description │       │ status      │
│ name        │       │ status      │       │ severity    │
│ created_at  │       │ creator_id  │       │ creator_id  │
└─────────────┘       │ start_date  │       │ created_at  │
                      │ end_date    │       │ resolved_at │
                      │ version     │       └─────────────┘
                      │ created_at  │
                      │ updated_at  │       ┌──────────────────┐
                      └─────────────┘       │ Task_Dependency  │
                            │ ∞             │                  │
                            └───────────────│ from_task_id (FK)│
                                          ∞ │ to_task_id (FK)  │
                                            │ created_at       │
                                            └──────────────────┘

┌─────────────────┐
│  Task_Issue     │
│                 │
│ task_id (FK)    │
│ issue_id (FK)   │
│ created_at      │
└─────────────────┘
```

---

## Core Entities

### 1. User

**Purpose**: Represents registered system users who can create and manage tasks/issues.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email (login credential) |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `name` | VARCHAR(255) | NOT NULL | User display name |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |

**Business Rules**:
- Email must be unique and valid format (validated at API layer)
- Password must be minimum 8 characters (enforced at registration)
- No soft deletes; user accounts persist indefinitely
- All users have equal permissions (no RBAC)

**Validation**:
```typescript
interface User {
  id: string;
  email: string;       // RFC 5322 email format
  name: string;        // 1-255 characters
  createdAt: Date;
}

// Zod schema
const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
  password: z.string().min(8),
});
```

---

### 2. Task

**Purpose**: Represents a unit of work with status, optional timeline, and dependency relationships.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique task identifier |
| `title` | VARCHAR(255) | NOT NULL | Task title |
| `description` | TEXT | NULLABLE | Detailed task description |
| `status` | VARCHAR(50) | DEFAULT 'To Do', CHECK constraint | Current task status |
| `creator_id` | UUID | FOREIGN KEY → users(id), NOT NULL | User who created the task |
| `start_date` | DATE | NULLABLE | Task start date (for Gantt chart) |
| `end_date` | DATE | NULLABLE | Task end date (for Gantt chart) |
| `version` | INTEGER | DEFAULT 1, NOT NULL | Optimistic lock version |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Task creation timestamp |
| `updated_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp |

**Status Values** (CHECK constraint):
- `To Do` - Initial state, not started
- `In Progress` - Actively being worked on
- `Complete` - Finished

**Business Rules**:
- Title is required (1-255 characters)
- Status can only be one of the predefined values
- Tasks without dates don't appear on Gantt chart (Kanban only)
- `end_date` must be >= `start_date` if both provided
- Version increments on every update (optimistic locking)
- Soft delete NOT implemented; tasks are permanently deleted

**Validation**:
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Complete';
  creatorId: string;
  startDate?: Date;
  endDate?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(['To Do', 'In Progress', 'Complete']),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate >= data.startDate;
  }
  return true;
}, { message: 'End date must be after start date' });
```

---

### 3. Issue

**Purpose**: Represents problems, bugs, or blockers that need resolution, separate from planned tasks.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique issue identifier |
| `title` | VARCHAR(255) | NOT NULL | Issue title |
| `description` | TEXT | NOT NULL | Detailed issue description |
| `status` | VARCHAR(50) | DEFAULT 'Open', CHECK constraint | Current issue status |
| `severity` | VARCHAR(50) | DEFAULT 'Medium', CHECK constraint | Issue severity level |
| `creator_id` | UUID | FOREIGN KEY → users(id), NOT NULL | User who logged the issue |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Issue creation timestamp |
| `resolved_at` | TIMESTAMP | NULLABLE | Issue resolution timestamp |

**Status Values** (CHECK constraint):
- `Open` - Issue is active, needs resolution
- `Resolved` - Issue has been fixed

**Severity Values** (CHECK constraint):
- `Low` - Minor issue, non-blocking
- `Medium` - Standard issue priority
- `High` - Critical issue, blocks work

**Business Rules**:
- Description is required (issues without context are invalid)
- Status can only transition between predefined values
- `resolved_at` is set automatically when status changes to 'Resolved'
- Severity does not auto-escalate (manual management)
- Issues can be linked to multiple tasks

**Validation**:
```typescript
interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'Open' | 'Resolved';
  severity: 'Low' | 'Medium' | 'High';
  creatorId: string;
  createdAt: Date;
  resolvedAt?: Date;
}

const IssueSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  status: z.enum(['Open', 'Resolved']),
  severity: z.enum(['Low', 'Medium', 'High']),
});
```

---

### 4. Task_Dependency

**Purpose**: Represents dependency relationships between tasks (visualized on Gantt chart).

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique dependency identifier |
| `from_task_id` | UUID | FOREIGN KEY → tasks(id), NOT NULL | Predecessor task (must complete first) |
| `to_task_id` | UUID | FOREIGN KEY → tasks(id), NOT NULL | Successor task (depends on predecessor) |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Dependency creation timestamp |

**Composite Unique Constraint**: `(from_task_id, to_task_id)`

**Business Rules**:
- Dependencies can ONLY be created in Gantt chart view (drag-and-connect gesture)
- Circular dependencies are prevented (validated before insertion)
- Dependencies are for visualization only; don't block task status changes
- Deleting a task cascades to delete its dependencies
- A task can have multiple predecessors and successors

**Circular Dependency Validation**:
```typescript
// Prevent cycles: Task A → Task B → Task C → Task A (INVALID)
async function wouldCreateCycle(fromTaskId: string, toTaskId: string): Promise<boolean> {
  const visited = new Set<string>();
  const queue = [toTaskId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === fromTaskId) return true; // Cycle detected
    
    visited.add(current);
    const dependencies = await getDependencies(current); // Query DB for successors
    queue.push(...dependencies.filter(id => !visited.has(id)));
  }

  return false;
}
```

**Validation**:
```typescript
interface TaskDependency {
  id: string;
  fromTaskId: string;  // Predecessor
  toTaskId: string;    // Successor
  createdAt: Date;
}

const TaskDependencySchema = z.object({
  fromTaskId: z.string().uuid(),
  toTaskId: z.string().uuid(),
}).refine((data) => data.fromTaskId !== data.toTaskId, {
  message: 'Task cannot depend on itself',
});
```

---

### 5. Task_Issue (Join Table)

**Purpose**: Many-to-many relationship between tasks and issues.

**Attributes**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique link identifier |
| `task_id` | UUID | FOREIGN KEY → tasks(id), NOT NULL | Linked task |
| `issue_id` | UUID | FOREIGN KEY → issues(id), NOT NULL | Linked issue |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Link creation timestamp |

**Composite Unique Constraint**: `(task_id, issue_id)`

**Business Rules**:
- A task can have multiple issues linked
- An issue can be linked to multiple tasks
- Links are bidirectional (visible from both task and issue views)
- Deleting a task or issue cascades to delete the link

**Validation**:
```typescript
interface TaskIssue {
  id: string;
  taskId: string;
  issueId: string;
  createdAt: Date;
}
```

---

## Database Schema (PostgreSQL)

### Schema: `prjmng3`

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable trigram index for search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Users Table
CREATE TABLE prjmng3.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Index for login lookups
CREATE INDEX idx_users_email ON prjmng3.users(email);

-- 2. Tasks Table
CREATE TABLE prjmng3.tasks (
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
CREATE INDEX idx_tasks_creator ON prjmng3.tasks(creator_id);
CREATE INDEX idx_tasks_status ON prjmng3.tasks(status);
CREATE INDEX idx_tasks_created_at ON prjmng3.tasks(created_at DESC);
CREATE INDEX idx_tasks_version ON prjmng3.tasks(id, version); -- Optimistic locking

-- Trigram indexes for search
CREATE INDEX idx_tasks_title_trgm ON prjmng3.tasks USING gin(title gin_trgm_ops);
CREATE INDEX idx_tasks_description_trgm ON prjmng3.tasks USING gin(description gin_trgm_ops);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION prjmng3.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at_trigger
BEFORE UPDATE ON prjmng3.tasks
FOR EACH ROW
EXECUTE FUNCTION prjmng3.update_updated_at_column();

-- 3. Issues Table
CREATE TABLE prjmng3.issues (
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
CREATE INDEX idx_issues_creator ON prjmng3.issues(creator_id);
CREATE INDEX idx_issues_status ON prjmng3.issues(status);
CREATE INDEX idx_issues_severity ON prjmng3.issues(severity);
CREATE INDEX idx_issues_created_at ON prjmng3.issues(created_at DESC);

-- 4. Task Dependencies Table
CREATE TABLE prjmng3.task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_task_id UUID NOT NULL REFERENCES prjmng3.tasks(id) ON DELETE CASCADE,
  to_task_id UUID NOT NULL REFERENCES prjmng3.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT no_self_dependency CHECK (from_task_id <> to_task_id),
  CONSTRAINT unique_dependency UNIQUE (from_task_id, to_task_id)
);

-- Indexes for dependency queries
CREATE INDEX idx_dependencies_from ON prjmng3.task_dependencies(from_task_id);
CREATE INDEX idx_dependencies_to ON prjmng3.task_dependencies(to_task_id);

-- 5. Task-Issue Links Table
CREATE TABLE prjmng3.task_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES prjmng3.tasks(id) ON DELETE CASCADE,
  issue_id UUID NOT NULL REFERENCES prjmng3.issues(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT unique_task_issue_link UNIQUE (task_id, issue_id)
);

-- Indexes for bidirectional lookups
CREATE INDEX idx_task_issues_task ON prjmng3.task_issues(task_id);
CREATE INDEX idx_task_issues_issue ON prjmng3.task_issues(issue_id);
```

---

## Relationships

### User → Tasks (One-to-Many)
- A user can create multiple tasks
- A task has exactly one creator
- **Cascade**: Deleting a user deletes all their tasks

### User → Issues (One-to-Many)
- A user can create multiple issues
- An issue has exactly one creator
- **Cascade**: Deleting a user deletes all their issues

### Task → Task_Dependencies (Many-to-Many via self-join)
- A task can have multiple predecessors (dependencies)
- A task can have multiple successors (dependents)
- **Cascade**: Deleting a task deletes all related dependencies

### Task ↔ Issue (Many-to-Many via Task_Issues)
- A task can have multiple linked issues
- An issue can be linked to multiple tasks
- **Cascade**: Deleting either task or issue deletes the link

---

## Data Access Patterns

### Common Queries

#### 1. Get All Tasks with Creator Info
```sql
SELECT 
  t.id, t.title, t.description, t.status, 
  t.start_date, t.end_date, t.version,
  t.created_at, t.updated_at,
  u.id as creator_id, u.name as creator_name, u.email as creator_email
FROM prjmng3.tasks t
INNER JOIN prjmng3.users u ON t.creator_id = u.id
ORDER BY t.created_at DESC;
```

#### 2. Get Task with Dependencies (for Gantt chart)
```sql
-- Get task with all predecessors and successors
SELECT 
  t.*,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', pred.id, 
        'title', pred.title,
        'type', 'predecessor'
      )
    ) FILTER (WHERE pred.id IS NOT NULL), 
    '[]'
  ) as predecessors,
  COALESCE(
    json_agg(
      DISTINCT jsonb_build_object(
        'id', succ.id, 
        'title', succ.title,
        'type', 'successor'
      )
    ) FILTER (WHERE succ.id IS NOT NULL), 
    '[]'
  ) as successors
FROM prjmng3.tasks t
LEFT JOIN prjmng3.task_dependencies td1 ON t.id = td1.to_task_id
LEFT JOIN prjmng3.tasks pred ON td1.from_task_id = pred.id
LEFT JOIN prjmng3.task_dependencies td2 ON t.id = td2.from_task_id
LEFT JOIN prjmng3.tasks succ ON td2.to_task_id = succ.id
WHERE t.id = $1
GROUP BY t.id;
```

#### 3. Search Tasks with Filters
```sql
SELECT t.*, u.name as creator_name
FROM prjmng3.tasks t
INNER JOIN prjmng3.users u ON t.creator_id = u.id
WHERE 
  (
    $1::TEXT IS NULL 
    OR title ILIKE $1 
    OR description ILIKE $1
  )
  AND ($2::TEXT IS NULL OR status = $2)
  AND ($3::UUID IS NULL OR creator_id = $3)
  AND ($4::DATE IS NULL OR start_date >= $4)
  AND ($5::DATE IS NULL OR end_date <= $5)
ORDER BY t.created_at DESC
LIMIT 50;
```

#### 4. Get Issue with Linked Tasks
```sql
SELECT 
  i.*,
  u.name as creator_name,
  COALESCE(
    json_agg(
      jsonb_build_object(
        'id', t.id,
        'title', t.title,
        'status', t.status
      )
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) as linked_tasks
FROM prjmng3.issues i
INNER JOIN prjmng3.users u ON i.creator_id = u.id
LEFT JOIN prjmng3.task_issues ti ON i.id = ti.issue_id
LEFT JOIN prjmng3.tasks t ON ti.task_id = t.id
WHERE i.id = $1
GROUP BY i.id, u.name;
```

---

## Migration Strategy

### Initial Setup (Development)
```bash
# Run schema creation script
psql postgresql://postgres:pass@localhost:5432/postgres -c "$(cat schema.sql)"

# Verify schema created
psql postgresql://postgres:pass@localhost:5432/postgres -c "\\dt prjmng3.*"
```

### Seed Data (Development)
```sql
-- Create test users
INSERT INTO prjmng3.users (email, password_hash, name) VALUES
  ('alice@example.com', '$2b$10$...', 'Alice'),
  ('bob@example.com', '$2b$10$...', 'Bob');

-- Create test tasks
INSERT INTO prjmng3.tasks (title, description, status, creator_id, start_date, end_date) VALUES
  ('Setup database', 'Create PostgreSQL schema', 'Complete', 
   (SELECT id FROM prjmng3.users WHERE email = 'alice@example.com'),
   '2025-01-20', '2025-01-22'),
  ('Build API', 'Implement REST endpoints', 'In Progress',
   (SELECT id FROM prjmng3.users WHERE email = 'bob@example.com'),
   '2025-01-23', '2025-01-30');
```

---

## Performance Considerations

| Concern | Solution |
|---------|----------|
| **Search Speed** | Trigram GIN indexes on title/description |
| **Dependency Traversal** | Indexed foreign keys, recursive CTE for cycles |
| **Optimistic Locking** | Version column + index on (id, version) |
| **Large Task Lists** | Pagination (LIMIT/OFFSET), indexed created_at |
| **Concurrent Updates** | Version-based optimistic locking prevents overwrites |

---

## Future Enhancements (Out of Scope for Pilot)

- **Soft Deletes**: Add `deleted_at` column for recoverability
- **Audit Log**: Track all changes (who, what, when) in separate table
- **Task Assignees**: Add `assignee_id` column (currently only creator tracked)
- **Issue Comments**: Add `issue_comments` table for threaded discussions
- **Task Tags**: Add `task_tags` table for categorization
- **Task Attachments**: Add `task_attachments` table for file uploads
- **Multi-Project Support**: Add `projects` table with tenant isolation

---

**Next**: Define API contracts in `contracts/openapi.yaml`
