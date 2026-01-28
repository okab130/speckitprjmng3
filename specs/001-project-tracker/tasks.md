# Tasks: Project & Task Management System

**Input**: Design documents from `/specs/001-project-tracker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: NOT included - no tests explicitly requested in spec.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a web application with `backend/` and `frontend/` directories at repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure per plan.md (src/models, src/services, src/api, src/middleware, src/db, src/websocket)
- [X] T002 Create frontend directory structure per plan.md (src/components, src/features, src/layouts, src/lib, src/hooks, src/store, src/types, src/styles)
- [X] T003 Initialize backend Node.js/TypeScript project with package.json in backend/
- [X] T004 Initialize frontend React/TypeScript project with Vite in frontend/
- [X] T005 [P] Install backend dependencies (express, socket.io, pg, bcrypt, jsonwebtoken, zod, cors, dotenv) in backend/package.json
- [X] T006 [P] Install frontend dependencies (@ant-design/icons, antd, zustand, socket.io-client, gantt-task-react, @hello-pangea/dnd, axios, react-router-dom) in frontend/package.json
- [X] T007 [P] Configure TypeScript for backend in backend/tsconfig.json
- [X] T008 [P] Configure TypeScript for frontend in frontend/tsconfig.json
- [X] T009 [P] Configure ESLint and Prettier for backend in backend/.eslintrc.json
- [X] T010 [P] Configure ESLint and Prettier for frontend in frontend/.eslintrc.json
- [X] T011 Create .env.example files for backend in backend/.env.example
- [X] T012 Create .env file for backend in backend/.env (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, PORT, NODE_ENV, FRONTEND_URL)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Foundation

- [X] T013 Create database schema SQL file at specs/001-project-tracker/schema.sql with all 5 tables (users, tasks, issues, task_dependencies, task_issues)
- [X] T014 Run schema.sql to create prjmng3 schema and tables in PostgreSQL
- [X] T015 Create database connection pool in backend/src/db/connection.ts using pg driver with 20-connection pool
- [X] T016 Create database query helper utilities in backend/src/db/queryHelpers.ts (transaction support, error handling)

### Backend Foundation

- [X] T017 [P] Create User TypeScript interface in backend/src/types/user.ts
- [X] T018 [P] Create Task TypeScript interface in backend/src/types/task.ts
- [X] T019 [P] Create Issue TypeScript interface in backend/src/types/issue.ts
- [X] T020 [P] Create TaskDependency TypeScript interface in backend/src/types/taskDependency.ts
- [X] T021 Create authentication middleware in backend/src/middleware/authenticate.ts (JWT Bearer token validation)
- [X] T022 Create error handler middleware in backend/src/middleware/errorHandler.ts (standardized error responses)
- [X] T023 Create validation middleware factory in backend/src/middleware/validation.ts (Zod schema validation)
- [X] T024 Initialize Express server in backend/src/index.ts (CORS, JSON parsing, routes, error handler)
- [X] T025 Create WebSocket server initialization in backend/src/websocket/server.ts (Socket.IO setup, room-based broadcasting, JWT auth)
- [X] T026 Create WebSocket service for broadcasting in backend/src/services/websocketService.ts

### Frontend Foundation

- [X] T027 [P] Create User TypeScript interface in frontend/src/types/user.ts
- [X] T028 [P] Create Task TypeScript interface in frontend/src/types/task.ts
- [X] T029 [P] Create Issue TypeScript interface in frontend/src/types/issue.ts
- [X] T030 Create Axios API client configuration in frontend/src/lib/api.ts (base URL, interceptors, JWT token handling)
- [X] T031 Create Socket.IO client initialization in frontend/src/lib/websocket.ts (connection, reconnection, JWT auth)
- [X] T032 Create WebSocket custom hook in frontend/src/hooks/useWebSocket.ts (event subscription, cleanup)
- [X] T033 Create auth store in frontend/src/store/authStore.ts using Zustand (login, logout, token management)
- [X] T034 Create MainLayout component in frontend/src/layouts/MainLayout.tsx (navigation, header, sidebar structure)
- [X] T035 Create App.tsx routing structure with React Router (auth routes, protected routes)
- [X] T036 Configure Ant Design theme in frontend/src/styles/theme.ts (GitHub-like colors and styling)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 5 - Register as a System User (Priority: P1) 🎯 MVP PREREQUISITE

**Goal**: Enable new team members to register and authenticate so they can access the system

**Independent Test**: Complete registration form → Create account → Login with credentials → Access system

**Why First**: Authentication is required for all other user stories. Users must be able to register and login before creating tasks, issues, or viewing boards.

### Backend Implementation

- [X] T037 [P] [US5] Create User model with CRUD operations in backend/src/models/User.ts (create, findByEmail, findById)
- [X] T038 [US5] Implement auth service in backend/src/services/authService.ts (register, login, password hashing with bcrypt, JWT generation)
- [X] T039 [US5] Create Zod validation schemas for auth in backend/src/api/auth.ts (email format, password min 8 chars, name length)
- [X] T040 [US5] Implement POST /api/auth/register endpoint in backend/src/api/auth.ts (create user, return JWT)
- [X] T041 [US5] Implement POST /api/auth/login endpoint in backend/src/api/auth.ts (validate credentials, return JWT)
- [X] T042 [US5] Implement POST /api/auth/refresh endpoint in backend/src/api/auth.ts (refresh access token)

### Frontend Implementation

- [X] T043 [P] [US5] Create RegisterForm component in frontend/src/features/auth/RegisterForm.tsx (name, email, password fields with Ant Design)
- [X] T044 [P] [US5] Create LoginForm component in frontend/src/features/auth/LoginForm.tsx (email, password fields with Ant Design)
- [X] T045 [US5] Create useAuth hook in frontend/src/hooks/useAuth.ts (register, login, logout, token refresh) [IMPLEMENTED IN AUTH STORE]
- [X] T046 [US5] Implement registration page in frontend/src/features/auth/RegisterPage.tsx (form submission, error handling, redirect on success) [COMBINED WITH FORM]
- [X] T047 [US5] Implement login page in frontend/src/features/auth/LoginPage.tsx (form submission, error handling, redirect on success) [COMBINED WITH FORM]
- [X] T048 [US5] Add form validation for registration (email format, password strength, unique email error handling)
- [X] T049 [US5] Add form validation for login (required fields, invalid credentials error display)
- [X] T050 [US5] Implement protected route wrapper in frontend/src/components/ProtectedRoute.tsx (redirect to login if not authenticated) [IMPLEMENTED IN APP.TSX]

**Checkpoint**: At this point, users can register, login, and access protected routes. This is the authentication foundation for all other user stories.

---

## Phase 4: User Story 1 - Create and Manage Tasks (Priority: P1) 🎯 MVP CORE

**Goal**: Enable project team members to create, update, and track tasks to organize work and communicate progress

**Independent Test**: Create new task with title/description → Update status from "To Do" to "In Progress" → Mark complete → Edit task details → Verify all changes persist

**Why Second**: Task management is the core foundation. This delivers immediate value as a basic task tracking system before adding visualizations.

### Backend Implementation

- [X] T051 [P] [US1] Create Task model with CRUD operations in backend/src/models/Task.ts (create, findAll, findById, update, delete, optimistic locking)
- [X] T052 [US1] Implement task service in backend/src/services/taskService.ts (business logic, validation, optimistic lock handling)
- [X] T053 [US1] Create Zod validation schemas for tasks in backend/src/api/tasks.ts (title required 1-255 chars, status enum, date range validation)
- [X] T054 [US1] Implement POST /api/tasks endpoint in backend/src/api/tasks.ts (create task, attribute to creator, broadcast task:created event)
- [X] T055 [US1] Implement GET /api/tasks endpoint in backend/src/api/tasks.ts (list all tasks with query filters)
- [X] T056 [US1] Implement GET /api/tasks/:id endpoint in backend/src/api/tasks.ts (get single task details)
- [X] T057 [US1] Implement PATCH /api/tasks/:id endpoint in backend/src/api/tasks.ts (update task, check version for optimistic locking, broadcast task:updated event)
- [X] T058 [US1] Implement DELETE /api/tasks/:id endpoint in backend/src/api/tasks.ts (delete task, broadcast task:deleted event)
- [X] T059 [US1] Add WebSocket event handlers for real-time task updates in backend/src/websocket/handlers.ts (task:created, task:updated, task:deleted broadcasting)

### Frontend Implementation

- [X] T060 [P] [US1] Create task store in frontend/src/store/taskStore.ts using Zustand (tasks state, CRUD actions, WebSocket sync)
- [X] T061 [P] [US1] Create useTasks hook in frontend/src/hooks/useTasks.ts (fetch tasks, create, update, delete with optimistic updates)
- [X] T062 [US1] Create TaskForm component in frontend/src/features/tasks/TaskForm.tsx (title, description, status fields using Ant Design)
- [X] T063 [US1] Create TaskList component in frontend/src/features/tasks/TaskList.tsx (Ant Design Table with tasks, edit/delete actions)
- [X] T064 [US1] Create TaskDetail modal component in frontend/src/features/tasks/TaskDetail.tsx (view/edit task details in Ant Design Modal)
- [X] T065 [US1] Implement task creation flow (show form, validate, submit, handle errors, update list)
- [X] T066 [US1] Implement task update flow (inline editing or modal, version handling, 409 conflict handling)
- [X] T067 [US1] Implement task deletion flow (confirmation modal, optimistic UI update)
- [X] T068 [US1] Add WebSocket listeners in task store for real-time updates (task:created, task:updated, task:deleted event handlers)
- [X] T069 [US1] Implement optimistic UI updates for task operations (instant feedback, rollback on error)
- [X] T070 [US1] Add task status badge styling (To Do: gray, In Progress: blue, Complete: green)


**Checkpoint**: At this point, User Story 1 should be fully functional. Users can create, view, edit, and delete tasks with real-time synchronization.

---

## Phase 5: User Story 2 - Visualize Work with Kanban Board (Priority: P1) 🎯 MVP VISUALIZATION

**Goal**: Enable team members to see all tasks organized in columns by status for quick understanding of work distribution

**Independent Test**: Create multiple tasks with different statuses → View Kanban board → Tasks appear in correct columns → Drag task between columns → Status updates automatically → Click task card → View/edit details

**Why Third**: Kanban provides visual organization essential for team coordination. Builds on User Story 1 (task management) without requiring new backend endpoints.

### Backend Implementation

- [X] T071 [US2] Add status change validation in backend/src/services/taskService.ts (ensure valid status transitions)
- [X] T072 [US2] Optimize GET /api/tasks endpoint for Kanban view (return grouped by status, ordered by creation date)

### Frontend Implementation

- [X] T073 [P] [US2] Create KanbanColumn component in frontend/src/components/kanban/KanbanColumn.tsx (status header, droppable area with @hello-pangea/dnd)
- [X] T074 [P] [US2] Create KanbanCard component in frontend/src/components/kanban/KanbanCard.tsx (task summary card, draggable with @hello-pangea/dnd)
- [X] T075 [US2] Create KanbanBoard component in frontend/src/features/kanban/KanbanBoard.tsx (3 columns: To Do, In Progress, Complete using DragDropContext)
- [X] T076 [US2] Implement drag-and-drop logic in KanbanBoard (onDragEnd handler, update task status, optimistic UI)
- [X] T077 [US2] Integrate KanbanBoard with task store (load tasks, listen to WebSocket updates, refresh columns)
- [X] T078 [US2] Implement task card click to open TaskDetail modal (reuse from User Story 1)
- [X] T079 [US2] Add real-time board updates via WebSocket (new tasks appear in correct column, moved tasks update instantly)
- [X] T080 [US2] Add visual feedback for drag operations (hover states, drop zones, dragging indicators)
- [X] T081 [US2] Add empty state for columns with no tasks (placeholder text, create task button)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users have both list and Kanban views for task management.

---

## Phase 6: User Story 3 - Register and Track Issues (Priority: P2)

**Goal**: Enable team members to log issues separately from tasks to track problems, bugs, or blockers independently from planned work

**Independent Test**: Create new issue with description and severity → View issue details → Mark as resolved → Link issue to task → View linked relationship on both issue and task

### Backend Implementation

- [X] T082 [P] [US3] Create Issue model with CRUD operations in backend/src/models/Issue.ts (create, findAll, findById, update, delete)
- [X] T083 [P] [US3] Create TaskIssue model for linking in backend/src/models/TaskIssue.ts (linkIssueToTask, unlinkIssueFromTask, getIssuesForTask, getTasksForIssue)
- [X] T084 [US3] Implement issue service in backend/src/services/issueService.ts (business logic, linking validation)
- [X] T085 [US3] Create Zod validation schemas for issues in backend/src/api/issues.ts (description required, status enum, severity enum)
- [X] T086 [US3] Implement POST /api/issues endpoint in backend/src/api/issues.ts (create issue, attribute to creator, broadcast issue:created event)
- [X] T087 [US3] Implement GET /api/issues endpoint in backend/src/api/issues.ts (list all issues with filters)
- [X] T088 [US3] Implement GET /api/issues/:id endpoint in backend/src/api/issues.ts (get single issue details)
- [X] T089 [US3] Implement PATCH /api/issues/:id endpoint in backend/src/api/issues.ts (update issue status, broadcast issue:updated event)
- [X] T090 [US3] Implement DELETE /api/issues/:id endpoint in backend/src/api/issues.ts (delete issue, broadcast issue:deleted event)
- [X] T091 [US3] Implement POST /api/tasks/:taskId/issues/:issueId endpoint in backend/src/api/tasks.ts (link issue to task)
- [X] T092 [US3] Implement DELETE /api/tasks/:taskId/issues/:issueId endpoint in backend/src/api/tasks.ts (unlink issue from task)
- [X] T093 [US3] Implement GET /api/tasks/:taskId/issues endpoint in backend/src/api/tasks.ts (get all issues linked to task)
- [X] T094 [US3] Add WebSocket event handlers for issues in backend/src/websocket/handlers.ts (issue:created, issue:updated, issue:deleted, issue:linked, issue:unlinked broadcasting)

### Frontend Implementation

- [X] T095 [P] [US3] Create issue store in frontend/src/store/issueStore.ts using Zustand (issues state, CRUD actions, linking actions, WebSocket sync)
- [X] T096 [P] [US3] Create useIssues hook in frontend/src/hooks/useIssues.ts (fetch issues, create, update, delete, link/unlink)
- [X] T097 [US3] Create IssueForm component in frontend/src/features/issues/IssueForm.tsx (description, status, severity fields using Ant Design)
- [X] T098 [US3] Create IssueList component in frontend/src/features/issues/IssueList.tsx (Ant Design Table with issues, resolve/delete actions)
- [X] T099 [US3] Create IssueDetail component in frontend/src/features/issues/IssueDetail.tsx (view/edit issue details, show linked tasks)
- [X] T100 [US3] Add issue linking UI to TaskDetail component (select issue dropdown, link button, linked issues list)
- [X] T101 [US3] Implement issue creation flow (show form, validate, submit, handle errors, update list)
- [X] T102 [US3] Implement issue update flow (mark as resolved, edit details)
- [X] T103 [US3] Implement issue-task linking flow (select issue, link to task, show relationship on both sides)
- [X] T104 [US3] Add WebSocket listeners in issue store for real-time updates (issue:created, issue:updated, issue:deleted, issue:linked, issue:unlinked)
- [X] T105 [US3] Add issue status badge styling (Open: red, Resolved: green)
- [X] T106 [US3] Add issue severity badge styling (High: red, Medium: orange, Low: blue)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Users can track issues separately and link them to tasks.

---

## Phase 7: User Story 4 - View Project Timeline with Gantt Chart (Priority: P2)

**Goal**: Enable project managers to visualize tasks on a timeline to understand project duration, identify dependencies, and communicate schedules

**Independent Test**: Create tasks with start/end dates → View Gantt chart → Tasks display as horizontal bars on timeline → Adjust task timeline by dragging → Create dependency by dragging from one task to another → Dependency lines show on chart

### Backend Implementation

- [ ] T107 [P] [US4] Create TaskDependency model with CRUD operations in backend/src/models/TaskDependency.ts (createDependency, deleteDependency, getDependenciesForTask, detectCircularDependency)
- [ ] T108 [US4] Implement dependency service in backend/src/services/dependencyService.ts (business logic, circular dependency prevention)
- [ ] T109 [US4] Create Zod validation schemas for dependencies in backend/src/api/dependencies.ts (from_task_id, to_task_id required)
- [ ] T110 [US4] Implement POST /api/dependencies endpoint in backend/src/api/dependencies.ts (create dependency, validate no circular deps, broadcast dependency:created event)
- [ ] T111 [US4] Implement GET /api/dependencies endpoint in backend/src/api/dependencies.ts (list all dependencies)
- [ ] T112 [US4] Implement DELETE /api/dependencies/:id endpoint in backend/src/api/dependencies.ts (delete dependency, broadcast dependency:deleted event)
- [ ] T113 [US4] Optimize GET /api/tasks endpoint for Gantt view (return with dependencies, ordered by start_date)
- [ ] T114 [US4] Add WebSocket event handlers for dependencies in backend/src/websocket/handlers.ts (dependency:created, dependency:deleted broadcasting)

### Frontend Implementation

- [ ] T115 [P] [US4] Create dependency store in frontend/src/store/dependencyStore.ts using Zustand (dependencies state, CRUD actions, WebSocket sync)
- [ ] T116 [P] [US4] Create useDependencies hook in frontend/src/hooks/useDependencies.ts (fetch dependencies, create, delete)
- [ ] T117 [US4] Create GanttChart component in frontend/src/features/gantt/GanttChart.tsx using gantt-task-react library
- [ ] T118 [US4] Configure gantt-task-react with project timeline (day/week/month zoom levels, today marker)
- [ ] T119 [US4] Transform task data to gantt-task-react format (convert Task objects to GanttTask format with dates)
- [ ] T120 [US4] Implement task timeline drag handler (update start_date and end_date on bar drag)
- [ ] T121 [US4] Implement dependency creation via drag-and-connect gesture (drag from task A to task B, create dependency)
- [ ] T122 [US4] Render dependency lines on Gantt chart (connect dependent tasks with arrows)
- [ ] T123 [US4] Add dependency deletion (right-click or button on dependency line)
- [ ] T124 [US4] Integrate GanttChart with task and dependency stores (load data, listen to WebSocket updates)
- [ ] T125 [US4] Add real-time Gantt updates via WebSocket (task date changes, new dependencies appear instantly)
- [ ] T126 [US4] Add visual feedback for dependency creation (drag preview, valid drop zones, circular dependency warning)
- [ ] T127 [US4] Handle tasks without dates (exclude from Gantt, show message in empty state)
- [ ] T128 [US4] Add date picker overlay for tasks in Gantt view (click task to edit dates inline)

**Checkpoint**: At this point, User Stories 1-4 should all work independently. Users have list view, Kanban board, and Gantt chart for comprehensive project visualization.

---

## Phase 8: User Story 6 - Search and Filter Tasks (Priority: P2)

**Goal**: Enable team members to search for tasks by keywords and filter by various criteria to quickly find specific tasks in large projects

**Independent Test**: Create multiple tasks with varied attributes → Type keywords in search bar → See matching tasks with highlights → Apply status filter → See filtered results → Apply multiple filters (status + creator + date range) → See tasks matching ALL criteria → Clear filters → See all tasks again

### Backend Implementation

- [ ] T129 [US6] Add search support to GET /api/tasks endpoint (query parameters: q for keyword, status, creator_id, start_date_from, start_date_to, end_date_from, end_date_to)
- [ ] T130 [US6] Implement keyword search in backend/src/models/Task.ts (ILIKE queries on title and description with trigram index)
- [ ] T131 [US6] Implement multi-filter logic in backend/src/services/taskService.ts (combine filters with AND logic, build dynamic SQL)
- [ ] T132 [US6] Add pagination support to GET /api/tasks endpoint (limit, offset parameters, return total count)
- [ ] T133 [US6] Create database index for search performance in schema.sql (trigram GIN index on tasks.title and tasks.description)

### Frontend Implementation

- [ ] T134 [P] [US6] Create SearchBar component in frontend/src/features/search/SearchBar.tsx (keyword input with Ant Design, debounced search)
- [ ] T135 [P] [US6] Create FilterPanel component in frontend/src/features/search/FilterPanel.tsx (status dropdown, creator select, date range picker using Ant Design)
- [ ] T136 [US6] Add search state to task store in frontend/src/store/taskStore.ts (search query, active filters, filtered results)
- [ ] T137 [US6] Implement search functionality in useTasks hook (debounced API calls, combine with filters)
- [ ] T138 [US6] Integrate SearchBar into TaskList component (search triggers filter update)
- [ ] T139 [US6] Integrate FilterPanel into TaskList component (filter changes trigger API calls)
- [ ] T140 [US6] Implement search result highlighting in TaskList and KanbanCard (highlight matching text in task titles/descriptions)
- [ ] T141 [US6] Add clear filters button (reset all filters and search query)
- [ ] T142 [US6] Add filter indicator badges (show active filters, click to remove individual filters)
- [ ] T143 [US6] Apply search/filter to Kanban board view (filter tasks in columns)
- [ ] T144 [US6] Apply search/filter to Gantt chart view (filter tasks on timeline)
- [ ] T145 [US6] Add loading states for search/filter operations (skeleton screens, spinners)
- [ ] T146 [US6] Add empty state for no search results (clear message, clear filters suggestion)

**Checkpoint**: All user stories (1-6) should now be independently functional. The system provides comprehensive task management, issue tracking, multiple visualizations, and powerful search/filtering.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Performance & Reliability

- [ ] T147 [P] Add error boundaries to React app in frontend/src/components/ErrorBoundary.tsx (catch rendering errors, show fallback UI)
- [ ] T148 [P] Implement loading states for all async operations (skeleton screens for lists, spinners for actions)
- [ ] T149 [P] Add retry logic for failed API requests in frontend/src/lib/api.ts (exponential backoff, max 3 retries)
- [ ] T150 Optimize WebSocket reconnection handling (state sync on reconnect, queue failed updates)
- [ ] T151 Add request rate limiting middleware in backend/src/middleware/rateLimit.ts (prevent abuse)
- [ ] T152 Add database query performance monitoring (log slow queries > 200ms)

**Note**: Data backup strategy is intentionally deferred per NFR-016 (pilot version scope). Standard database persistence is sufficient for this phase.

### User Experience

- [ ] T153 [P] Add toast notifications for all user actions in frontend/src/lib/notifications.ts (success, error, info using Ant Design message)
- [ ] T154 [P] Add loading skeletons for all data-heavy components (TaskList, KanbanBoard, GanttChart)
- [ ] T155 [P] Implement responsive design for mobile devices (adjust layouts, touch-friendly controls)
- [ ] T156 Add keyboard shortcuts for common actions (Ctrl+K for search, Ctrl+N for new task)
- [ ] T157 Add user profile dropdown in header (display name, logout button)
- [ ] T158 Add system status indicator (online/offline, connection status)

### Code Quality & Documentation

- [ ] T159 [P] Add JSDoc comments to all backend services and models
- [ ] T160 [P] Add TSDoc comments to all frontend components and hooks
- [ ] T161 [P] Create README.md in backend/ with API documentation
- [ ] T162 [P] Create README.md in frontend/ with component documentation
- [ ] T163 [P] Add request/response logging middleware in backend/src/middleware/logger.ts
- [ ] T164 Refactor common validation logic into shared utilities
- [ ] T165 Refactor common UI components (buttons, inputs, modals) into frontend/src/components/common/

### Security & Validation

- [ ] T166 [P] Add Content Security Policy headers in backend/src/middleware/security.ts
- [ ] T167 [P] Add input sanitization for all user inputs (prevent XSS, SQL injection)
- [ ] T168 [P] Implement CORS configuration properly in backend/src/index.ts (whitelist frontend origin)
- [ ] T169 Add password strength indicator to registration form
- [ ] T170 Add rate limiting for authentication endpoints (prevent brute force attacks)
- [ ] T171 Add validation for task dependency creation (prevent circular dependencies on frontend)

### Final Validation

- [ ] T172 Run through quickstart.md setup guide to verify all steps work
- [ ] T173 Test all user stories end-to-end in clean environment
- [ ] T174 Verify WebSocket real-time synchronization with multiple browser sessions
- [ ] T175 Test optimistic locking with concurrent edits
- [ ] T176 Verify performance with 100+ tasks (Gantt rendering < 3 seconds)
- [ ] T177 Test search performance with 500 tasks (results < 1 second)
- [ ] T178 Verify all API endpoints return correct status codes and error messages
- [ ] T179 Test authentication flow (register → login → token refresh → logout)
- [ ] T180 Verify database schema matches data-model.md specification

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 5 - Registration (Phase 3)**: Depends on Foundational phase - BLOCKS all other user stories (authentication required)
- **User Story 1 - Tasks (Phase 4)**: Depends on US5 completion (authentication) - Core task management
- **User Story 2 - Kanban (Phase 5)**: Depends on US1 completion (requires tasks) - Visualization layer
- **User Story 3 - Issues (Phase 6)**: Depends on US1 completion (requires tasks for linking) - Independent feature
- **User Story 4 - Gantt (Phase 7)**: Depends on US1 completion (requires tasks with dates) - Visualization + dependencies
- **User Story 6 - Search (Phase 8)**: Depends on US1 completion (requires tasks to search) - Enhancement layer
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 5 (P1) - Registration**: MUST complete first - No dependencies on other stories
- **User Story 1 (P1) - Tasks**: Can start after US5 - No dependencies on other stories (except auth)
- **User Story 2 (P1) - Kanban**: Can start after US1 - Requires task CRUD operations
- **User Story 3 (P2) - Issues**: Can start after US1 - Requires tasks for linking but independently testable
- **User Story 4 (P2) - Gantt**: Can start after US1 - Requires tasks with dates and adds dependencies
- **User Story 6 (P2) - Search**: Can start after US1 - Requires tasks to search but independently testable

### Within Each User Story

- Backend models before backend services
- Backend services before backend API endpoints
- Backend API complete before frontend integration
- Frontend stores/hooks before frontend components
- Core components before composite features
- Story complete and tested before moving to next priority

### Parallel Opportunities

**Setup Phase (Phase 1)**:
- T005 (backend deps), T006 (frontend deps) can run in parallel
- T007 (backend tsconfig), T008 (frontend tsconfig) can run in parallel
- T009 (backend eslint), T010 (frontend eslint) can run in parallel

**Foundational Phase (Phase 2)**:
- T017-T020 (all TypeScript interfaces) can run in parallel
- Backend foundation and Frontend foundation can run in parallel once DB is ready

**User Story 5 - Registration (Phase 3)**:
- T037 (User model) runs alone
- T043 (RegisterForm), T044 (LoginForm) can run in parallel after T038 completes

**User Story 1 - Tasks (Phase 4)**:
- T060 (task store), T061 (useTasks hook) can run in parallel
- T062 (TaskForm), T063 (TaskList), T064 (TaskDetail) can run in parallel after store/hook ready

**User Story 2 - Kanban (Phase 5)**:
- T073 (KanbanColumn), T074 (KanbanCard) can run in parallel
- Once components ready, integration tasks run sequentially

**User Story 3 - Issues (Phase 6)**:
- T082 (Issue model), T083 (TaskIssue model) can run in parallel
- T095 (issue store), T096 (useIssues hook) can run in parallel
- T097 (IssueForm), T098 (IssueList), T099 (IssueDetail) can run in parallel

**User Story 4 - Gantt (Phase 7)**:
- T107 (TaskDependency model) runs alone
- T115 (dependency store), T116 (useDependencies hook) can run in parallel after T107

**User Story 6 - Search (Phase 8)**:
- T134 (SearchBar), T135 (FilterPanel) can run in parallel

**Polish Phase (Phase 9)**:
- Most polish tasks can run in parallel (different files/features)

---

## Parallel Example: User Story 1 - Tasks

```bash
# After backend API is ready, launch all frontend components together:

# Session 1: Task Store
Task T060: Create task store in frontend/src/store/taskStore.ts

# Session 2: Task Hook
Task T061: Create useTasks hook in frontend/src/hooks/useTasks.ts

# Then after store/hook are ready, launch all UI components:

# Session 1: Task Form
Task T062: Create TaskForm component in frontend/src/features/tasks/TaskForm.tsx

# Session 2: Task List
Task T063: Create TaskList component in frontend/src/features/tasks/TaskList.tsx

# Session 3: Task Detail
Task T064: Create TaskDetail modal component in frontend/src/features/tasks/TaskDetail.tsx
```

---

## Implementation Strategy

### MVP First (Phase 1-5: Setup → Foundational → US5 → US1 → US2)

1. Complete Phase 1: Setup (project structure, dependencies)
2. Complete Phase 2: Foundational (database, auth infrastructure, base types) - CRITICAL GATE
3. Complete Phase 3: User Story 5 (registration & authentication) - REQUIRED FOR ALL OTHER STORIES
4. Complete Phase 4: User Story 1 (task CRUD) - CORE FUNCTIONALITY
5. Complete Phase 5: User Story 2 (Kanban board) - FIRST VISUALIZATION
6. **STOP and VALIDATE**: Test US5 + US1 + US2 together
7. Deploy/demo MVP (users can register, create/manage tasks, view Kanban board)

**MVP Scope**: Setup + Foundational + US5 + US1 + US2 = ~70 tasks
**MVP Delivers**: User registration, authentication, task creation/management, Kanban board with drag-and-drop, real-time synchronization
**Time Estimate**: 2-3 weeks with 1-2 developers

### Incremental Delivery (Add US3, US4, US6)

1. Complete Setup + Foundational + US5 + US1 + US2 → Foundation + Task Management MVP
2. Add Phase 6: User Story 3 (issue tracking) → Test independently → Deploy/Demo
3. Add Phase 7: User Story 4 (Gantt chart + dependencies) → Test independently → Deploy/Demo
4. Add Phase 8: User Story 6 (search & filtering) → Test independently → Deploy/Demo
5. Complete Phase 9: Polish → Final release

**Full Scope**: 180 tasks total
**Time Estimate**: 4-6 weeks with 1-2 developers

### Parallel Team Strategy (3+ Developers)

With multiple developers:

1. **Week 1**: Team completes Setup + Foundational together (everyone needs the foundation)
2. **Week 2**: Team completes US5 together (authentication gates everything)
3. **Week 3-4**: Parallel development once US5 is complete:
   - Developer A: User Story 1 (tasks)
   - Developer B: User Story 3 (issues) - starts after US1 backend models complete
   - Developer C: Setup for US2 (Kanban) - starts after US1 is functional
4. **Week 4-5**: Continue parallel:
   - Developer A: User Story 2 (Kanban) - builds on US1
   - Developer B: User Story 4 (Gantt) - builds on US1
   - Developer C: User Story 6 (Search) - builds on US1
5. **Week 6**: Team completes Polish together

**Time Estimate with 3 developers**: 4-5 weeks

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- User Story 5 (Registration) MUST complete before any other user story
- User Story 1 (Tasks) MUST complete before US2, US3, US4, US6 (they all depend on tasks)
- Tests are NOT included (not requested in spec.md)

---

## Task Count Summary

- **Phase 1 (Setup)**: 12 tasks
- **Phase 2 (Foundational)**: 24 tasks
- **Phase 3 (US5 - Registration)**: 14 tasks
- **Phase 4 (US1 - Tasks)**: 20 tasks
- **Phase 5 (US2 - Kanban)**: 9 tasks
- **Phase 6 (US3 - Issues)**: 25 tasks
- **Phase 7 (US4 - Gantt)**: 22 tasks
- **Phase 8 (US6 - Search)**: 18 tasks
- **Phase 9 (Polish)**: 36 tasks

**Total**: 180 tasks

**MVP Scope** (Phases 1-5): 79 tasks
**Full Feature Set** (Phases 1-8): 144 tasks
**With Polish** (Phases 1-9): 180 tasks
