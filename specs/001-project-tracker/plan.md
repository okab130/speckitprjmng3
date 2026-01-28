# Implementation Plan: Project & Task Management System

**Branch**: `001-project-tracker` | **Date**: 2025-01-26 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-project-tracker/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

A GitHub-style project management system with task/issue tracking, real-time WebSocket synchronization, Kanban board with drag-and-drop, interactive Gantt chart with dependency creation, search/filtering, and user registration. All registered users have full access (no RBAC). Backend is Node.js/Express with PostgreSQL (schema `prjmng3` already exists), frontend is React following GitHub-like design guidelines with Ant Design components.

## Technical Context

**Language/Version**: 
- Backend: Node.js 18+ with TypeScript 5.3+
- Frontend: React 18+ with TypeScript 5.3+

**Primary Dependencies**: 
- Backend: Express 4.18+, Socket.IO 4.6+ (WebSocket), pg 8.11+ (PostgreSQL driver), bcrypt (password hashing), jsonwebtoken (JWT auth)
- Frontend: Ant Design 5.12+, Zustand (state management), @hello-pangea/dnd (Kanban drag-and-drop), gantt-task-react (Gantt chart), SWR (data fetching), Socket.IO client

**Storage**: PostgreSQL 15+ (Docker container 'db', schema 'prjmng3' already created)
- Connection: postgresql://postgres:pass@localhost:5432/postgres?currentSchema=prjmng3

**Testing**: 
- Backend: Jest + Supertest (API tests)
- Frontend: Vitest + React Testing Library
- Integration: Contract tests for API endpoints

**Target Platform**: 
- Backend: Node.js server on Linux/Docker
- Frontend: Modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Primary usage: Desktop/laptop (mobile-responsive desired but not critical)

**Project Type**: Web application (full-stack: backend + frontend)

**Performance Goals**: 
- API response time: <200ms p95 for CRUD operations
- WebSocket notification delivery: <2 seconds from event to client
- Gantt chart rendering: <3 seconds for 100 tasks
- Search results: <1 second from query input
- View switching (Kanban ↔ Gantt): <1 second

**Constraints**: 
- Real-time updates required (WebSocket mandatory)
- Optimistic locking with last-write-wins for concurrent edits
- No formal backup strategy required for pilot version
- 50 concurrent users support target
- Task dependencies created exclusively via Gantt chart drag-and-connect gesture

**Scale/Scope**: 
- 5-50 users initially
- 50-500 tasks per project
- Single project workspace (multi-project support out of scope)
- 6 user stories (P1: tasks, Kanban, registration; P2: issues, Gantt, search/filtering)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: Template constitution found - no specific project principles defined yet.

**Initial Gate Evaluation (Before Phase 0)**: 
- ✅ No violations detected in current architecture
- ✅ Standard web application structure (frontend + backend separation)
- ✅ Conventional technology choices for requirements
- ⚠️ Constitution template needs customization for this project (future work)

**Phase 1 Re-check (After Design Completion)**: 
- ✅ Data model follows standard relational database patterns
- ✅ API contracts follow REST + WebSocket conventions
- ✅ No architectural complexity violations detected
- ✅ Technology choices validated through research (Phase 0)
- ✅ Project structure supports independent backend/frontend development
- ⚠️ Constitution remains template - should be customized with project-specific principles

**Final Status**: APPROVED for Phase 2 implementation

## Project Structure

### Documentation (this feature)

```text
specs/001-project-tracker/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── openapi.yaml     # REST API specification
│   └── websocket.md     # WebSocket events specification
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # Database models (TypeORM or raw SQL)
│   │   ├── User.ts
│   │   ├── Task.ts
│   │   ├── Issue.ts
│   │   └── TaskDependency.ts
│   ├── services/        # Business logic layer
│   │   ├── authService.ts
│   │   ├── taskService.ts
│   │   ├── issueService.ts
│   │   └── websocketService.ts
│   ├── api/             # REST API routes
│   │   ├── auth.ts
│   │   ├── tasks.ts
│   │   ├── issues.ts
│   │   └── users.ts
│   ├── middleware/      # Auth, error handling, validation
│   │   ├── authenticate.ts
│   │   ├── errorHandler.ts
│   │   └── validation.ts
│   ├── db/              # Database connection and migrations
│   │   ├── connection.ts
│   │   └── migrations/
│   ├── websocket/       # WebSocket event handlers
│   │   ├── handlers.ts
│   │   └── events.ts
│   └── index.ts         # Server entry point
├── tests/
│   ├── contract/        # API contract tests
│   ├── integration/     # Database + service integration tests
│   └── unit/            # Service unit tests
├── package.json
└── tsconfig.json

frontend/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── common/      # Generic components (buttons, inputs)
│   │   ├── tables/      # Task/issue tables
│   │   ├── kanban/      # Kanban board components
│   │   └── gantt/       # Gantt chart components
│   ├── features/        # Feature-specific modules
│   │   ├── auth/        # Login/registration
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── tasks/       # Task management
│   │   │   ├── TaskList.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   └── TaskDetail.tsx
│   │   ├── issues/      # Issue tracking
│   │   │   ├── IssueList.tsx
│   │   │   ├── IssueForm.tsx
│   │   │   └── IssueDetail.tsx
│   │   ├── kanban/      # Kanban board views
│   │   │   └── KanbanBoard.tsx
│   │   ├── gantt/       # Gantt chart views
│   │   │   └── GanttChart.tsx
│   │   └── search/      # Search and filtering
│   │       └── SearchBar.tsx
│   ├── layouts/         # Layout components
│   │   └── MainLayout.tsx
│   ├── lib/             # Utilities and API client
│   │   ├── api.ts       # Axios configuration
│   │   ├── websocket.ts # Socket.IO client setup
│   │   └── utils.ts
│   ├── hooks/           # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   ├── useIssues.ts
│   │   └── useWebSocket.ts
│   ├── store/           # Zustand state management
│   │   ├── authStore.ts
│   │   ├── taskStore.ts
│   │   └── issueStore.ts
│   ├── types/           # TypeScript type definitions
│   │   ├── task.ts
│   │   ├── issue.ts
│   │   └── user.ts
│   ├── styles/          # Global styles and theme
│   │   └── theme.ts
│   ├── App.tsx          # Root application component
│   └── main.tsx         # Entry point
├── tests/
│   ├── unit/            # Component unit tests
│   └── integration/     # User flow integration tests
├── package.json
├── tsconfig.json
└── vite.config.ts

docker-compose.yml       # PostgreSQL container (already exists)
.env.example            # Environment variable template
README.md
```

**Structure Decision**: Web application structure chosen due to clear frontend/backend separation. Backend handles API, business logic, database access, and WebSocket server. Frontend is a SPA (Single Page Application) built with React + Ant Design following the design guidelines. This separation enables independent deployment, scaling, and testing of each layer.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*No violations to justify at this stage.*

---

## Phase 0: Research & Technology Validation

### Research Tasks

The following areas require investigation to resolve "NEEDS CLARIFICATION" items and validate technology choices:

1. **WebSocket Integration Pattern** (High Priority)
   - **Question**: Best practices for Socket.IO with Express + React
   - **Research Goal**: Architecture pattern for real-time synchronization (server-side event broadcasting, client-side state updates)
   - **Deliverable**: Connection setup code patterns, event naming conventions, error handling

2. **Gantt Chart Dependency Creation** (High Priority)
   - **Question**: How to implement drag-and-connect gesture in gantt-task-react library
   - **Research Goal**: Determine if gantt-task-react supports dependency creation via drag-and-connect; identify alternatives if not
   - **Deliverable**: Code example or alternative library recommendation (e.g., DHTMLX Gantt, Bryntum Gantt)

3. **Optimistic Locking Implementation** (Medium Priority)
   - **Question**: Best approach for last-write-wins with PostgreSQL
   - **Research Goal**: Version column strategy, timestamp comparison, or ETag-based approach
   - **Deliverable**: Database schema pattern + API implementation example

4. **PostgreSQL Connection Pooling** (Medium Priority)
   - **Question**: Best practices for pg driver with Express
   - **Research Goal**: Connection pool configuration for 50 concurrent users
   - **Deliverable**: Connection setup code with pool sizing recommendations

5. **JWT Authentication Flow** (Low Priority)
   - **Question**: Token storage strategy (localStorage vs httpOnly cookies)
   - **Research Goal**: Security best practices balancing XSS/CSRF risks
   - **Deliverable**: Implementation pattern with refresh token strategy

6. **Search Performance** (Low Priority)
   - **Question**: PostgreSQL full-text search vs LIKE queries for task/issue search
   - **Research Goal**: Performance comparison for expected data volumes (500 tasks)
   - **Deliverable**: Query patterns with performance characteristics

### Technology Stack Validation

**Confirmed Choices**:
- ✅ React 18 + Ant Design 5.12 (per design guidelines)
- ✅ Node.js/Express backend (standard choice for requirements)
- ✅ PostgreSQL (already provisioned in Docker)
- ✅ Socket.IO (industry standard for WebSocket with fallback support)
- ✅ @hello-pangea/dnd (react-beautiful-dnd successor for Kanban)

**Pending Validation**:
- ⚠️ gantt-task-react (need to confirm drag-and-connect dependency support)
- ⚠️ pg driver vs TypeORM (raw SQL flexibility vs ORM convenience trade-off)

---

## Phase 1: Design Artifacts

*✅ COMPLETED - All design artifacts generated*

### Deliverables

1. ✅ **data-model.md**: Entity definitions, relationships, database schema (PostgreSQL with 5 tables: users, tasks, issues, task_dependencies, task_issues)
2. ✅ **contracts/openapi.yaml**: REST API endpoints (Auth, Tasks, Issues, Dependencies, Users - 15 endpoints total)
3. ✅ **contracts/websocket.md**: WebSocket event specifications (11 event types: task:*, issue:*, dependency:*, sync:*)
4. ✅ **quickstart.md**: Developer setup guide (30-minute setup with Docker, PostgreSQL, Node.js)
5. ✅ **Agent context updated**: Copilot agent context file created at `.github/agents/copilot-instructions.md`

### Design Decisions Summary

- **Database Schema**: 5 tables with UUID primary keys, optimistic locking (version column), trigram indexes for search
- **REST API**: 15 endpoints following OpenAPI 3.0 specification, JWT Bearer authentication, optimistic locking with 409 Conflict responses
- **WebSocket Protocol**: Socket.IO with `entity:action` event naming, room-based broadcasting, automatic reconnection with state sync
- **Technology Stack**: Node.js/Express + React/Ant Design validated through Phase 0 research

---

## Phase 2: Task Breakdown

*Generated by `/speckit.tasks` command - NOT included in this plan*

**Expected Output**: `tasks.md` with dependency-ordered implementation tasks

---

## Risks & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| gantt-task-react doesn't support drag-and-connect dependency creation | High | Medium | Research alternative: DHTMLX Gantt, custom D3.js implementation, or defer to Phase 2 |
| WebSocket connection drops cause data inconsistency | High | Low | Implement automatic reconnection + state sync on reconnect |
| Concurrent edit conflicts confuse users (last-write-wins) | Medium | Medium | Clear UI feedback on save; consider showing "Last updated by X at Y" timestamp |
| PostgreSQL performance degrades with 500+ tasks | Medium | Low | Add indexes on search columns (title, description); use EXPLAIN ANALYZE to optimize queries |
| 50 concurrent users exceed WebSocket server capacity | Medium | Low | Load testing early; configure Socket.IO for horizontal scaling if needed |
| JWT token theft via XSS | Medium | Medium | Use httpOnly cookies if possible; implement Content Security Policy (CSP) headers |

---

## Next Steps

1. **Execute Phase 0**: Generate `research.md` by dispatching research agents for each task above
2. **Execute Phase 1**: Create data-model.md, contracts/, quickstart.md based on research findings
3. **Update Agent Context**: Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType copilot`
4. **Re-evaluate Gates**: Verify Constitution Check compliance after design artifacts complete
5. **Proceed to Phase 2**: Run `/speckit.tasks` command to generate implementation task breakdown
