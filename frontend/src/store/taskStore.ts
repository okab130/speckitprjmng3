import { create } from 'zustand';
import api from '../lib/api';
import { Task, CreateTaskInput, UpdateTaskInput, TaskSearchFilters, TaskStatus } from '../types/task';

interface TaskState {
  tasks: Task[];
  selectedTask: Task | null;
  isLoading: boolean;
  error: string | null;
  
  // CRUD actions
  fetchTasks: (filters?: TaskSearchFilters) => Promise<void>;
  fetchTaskById: (id: string) => Promise<Task>;
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  
  // Kanban-specific actions
  fetchTasksGroupedByStatus: () => Promise<Record<TaskStatus, Task[]>>;
  updateTaskStatus: (id: string, newStatus: TaskStatus, currentVersion: number) => Promise<Task>;
  
  // UI state management
  setSelectedTask: (task: Task | null) => void;
  clearError: () => void;
  
  // WebSocket event handlers
  handleTaskCreated: (task: Task) => void;
  handleTaskUpdated: (task: Task) => void;
  handleTaskDeleted: (taskId: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null,

  fetchTasks: async (filters?: TaskSearchFilters) => {
    set({ isLoading: true, error: null });
    try {
      // Clean up filters - remove undefined values
      const cleanFilters = filters ? Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      ) : {};
      
      const response = await api.get<Task[]>('/tasks', { params: cleanFilters });
      set({ tasks: response.data, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch tasks',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchTaskById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Task>(`/tasks/${id}`);
      set({ selectedTask: response.data, isLoading: false });
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch task',
        isLoading: false,
      });
      throw error;
    }
  },

  createTask: async (data: CreateTaskInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<Task>('/tasks', data);
      const newTask = response.data;
      
      // Don't add to state here - let WebSocket event handle it
      // This prevents duplicates when WebSocket broadcasts the same task
      set({ isLoading: false });
      
      return newTask;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to create task',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTask: async (id: string, data: UpdateTaskInput) => {
    set({ isLoading: true, error: null });
    
    // Store original task for rollback
    const originalTasks = get().tasks;
    
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...data, version: data.version + 1 } : task
      ),
    }));
    
    try {
      const response = await api.patch<Task>(`/tasks/${id}`, data);
      const updatedTask = response.data;
      
      // Update with server response
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      
      return updatedTask;
    } catch (error: any) {
      // Rollback on error
      set({
        tasks: originalTasks,
        error: error.response?.data?.error || 'Failed to update task',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    
    // Store original tasks for rollback
    const originalTasks = get().tasks;
    
    // Optimistic update: Remove from local state
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
    
    try {
      await api.delete(`/tasks/${id}`);
      set({ isLoading: false });
    } catch (error: any) {
      // Rollback on error
      set({
        tasks: originalTasks,
        error: error.response?.data?.error || 'Failed to delete task',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchTasksGroupedByStatus: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Record<TaskStatus, Task[]>>('/tasks', {
        params: { groupByStatus: 'true' },
      });
      
      // Update tasks array with all tasks from grouped data
      const allTasks: Task[] = Object.values(response.data).flat();
      set({ tasks: allTasks, isLoading: false });
      
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.error || 'Failed to fetch tasks',
        isLoading: false,
      });
      throw error;
    }
  },

  updateTaskStatus: async (id: string, newStatus: TaskStatus, currentVersion: number) => {
    set({ isLoading: true, error: null });
    
    // Store original task for rollback
    const originalTasks = get().tasks;
    
    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus, version: currentVersion + 1 } : task
      ),
    }));
    
    try {
      const response = await api.patch<Task>(`/tasks/${id}`, {
        status: newStatus,
        version: currentVersion,
      });
      const updatedTask = response.data;
      
      // Update with server response
      set((state) => ({
        tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
        selectedTask: state.selectedTask?.id === id ? updatedTask : state.selectedTask,
        isLoading: false,
      }));
      
      return updatedTask;
    } catch (error: any) {
      // Rollback on error
      set({
        tasks: originalTasks,
        error: error.response?.data?.error || 'Failed to update task status',
        isLoading: false,
      });
      throw error;
    }
  },

  setSelectedTask: (task: Task | null) => {
    set({ selectedTask: task });
  },

  clearError: () => {
    set({ error: null });
  },

  // WebSocket event handlers
  handleTaskCreated: (task: Task) => {
    set((state) => {
      // Avoid duplicates - check if task already exists
      const exists = state.tasks.some((t) => t.id === task.id);
      if (exists) {
        console.log('[TaskStore] Task already exists, skipping WebSocket duplicate:', task.id);
        return state;
      }
      
      console.log('[TaskStore] Adding task from WebSocket:', task.id);
      return { tasks: [task, ...state.tasks] };
    });
  },

  handleTaskUpdated: (task: Task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
      selectedTask: state.selectedTask?.id === task.id ? task : state.selectedTask,
    }));
  },

  handleTaskDeleted: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      selectedTask: state.selectedTask?.id === taskId ? null : state.selectedTask,
    }));
  },
}));
