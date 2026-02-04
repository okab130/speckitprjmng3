import { create } from 'zustand';
import { Issue } from '../types/issue';
import api from '../lib/api';

interface IssueState {
  issues: Issue[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchIssues: (filters?: { status?: string; severity?: string; projectId?: string }) => Promise<void>;
  fetchIssueById: (id: string) => Promise<Issue | null>;
  createIssue: (issue: Omit<Issue, 'id' | 'creatorId' | 'createdAt' | 'resolvedAt'>) => Promise<Issue>;
  updateIssue: (id: string, updates: Partial<Issue>) => Promise<Issue>;
  deleteIssue: (id: string) => Promise<void>;
  linkIssueToTask: (taskId: string, issueId: string) => Promise<void>;
  unlinkIssueFromTask: (taskId: string, issueId: string) => Promise<void>;
  fetchIssuesForTask: (taskId: string) => Promise<Issue[]>;
  
  // WebSocket handlers
  handleIssueCreated: (issue: Issue) => void;
  handleIssueUpdated: (issue: Issue) => void;
  handleIssueDeleted: (payload: { id: string }) => void;
  handleIssueLinked: (payload: { taskId: string; issueId: string }) => void;
  handleIssueUnlinked: (payload: { taskId: string; issueId: string }) => void;
}

export const useIssueStore = create<IssueState>((set) => ({
  issues: [],
  loading: false,
  error: null,

  // Fetch all issues with optional filters
  fetchIssues: async (filters) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.severity) params.append('severity', filters.severity);
      if (filters?.projectId) params.append('projectId', filters.projectId);
      
      const response = await api.get(`/issues?${params.toString()}`);
      set({ issues: response.data, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch issues',
        loading: false 
      });
      throw error;
    }
  },

  // Fetch single issue by ID
  fetchIssueById: async (id) => {
    try {
      const response = await api.get(`/issues/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch issue:', error);
      return null;
    }
  },

  // Create a new issue
  createIssue: async (issueData) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/issues', issueData);
      const newIssue = response.data;
      
      // Don't add to state here - let WebSocket event handle it
      // This prevents duplicates when WebSocket broadcasts the same issue
      set({ loading: false });
      
      return newIssue;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create issue',
        loading: false 
      });
      throw error;
    }
  },

  // Update an issue
  updateIssue: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/issues/${id}`, updates);
      const updatedIssue = response.data;
      
      // Update in state
      set((state) => ({
        issues: state.issues.map((issue) =>
          issue.id === id ? updatedIssue : issue
        ),
        loading: false,
      }));
      
      return updatedIssue;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update issue',
        loading: false 
      });
      throw error;
    }
  },

  // Delete an issue
  deleteIssue: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/issues/${id}`);
      
      // Remove from state
      set((state) => ({
        issues: state.issues.filter((issue) => issue.id !== id),
        loading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete issue',
        loading: false 
      });
      throw error;
    }
  },

  // Link issue to task
  linkIssueToTask: async (taskId, issueId) => {
    try {
      await api.post(`/api/tasks/${taskId}/issues/${issueId}`);
    } catch (error: any) {
      console.error('Failed to link issue to task:', error);
      throw error;
    }
  },

  // Unlink issue from task
  unlinkIssueFromTask: async (taskId, issueId) => {
    try {
      await api.delete(`/api/tasks/${taskId}/issues/${issueId}`);
    } catch (error: any) {
      console.error('Failed to unlink issue from task:', error);
      throw error;
    }
  },

  // Fetch issues for a specific task
  fetchIssuesForTask: async (taskId) => {
    try {
      const response = await api.get(`/api/tasks/${taskId}/issues`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch issues for task:', error);
      return [];
    }
  },

  // WebSocket event handlers
  handleIssueCreated: (issue) => {
    set((state) => {
      // Avoid duplicates
      if (state.issues.some((i) => i.id === issue.id)) {
        return state;
      }
      return { issues: [issue, ...state.issues] };
    });
  },

  handleIssueUpdated: (issue) => {
    console.log('[IssueStore] handleIssueUpdated called with issue:', issue.id, issue.status);
    set((state) => {
      const updated = state.issues.map((i) => (i.id === issue.id ? issue : i));
      console.log('[IssueStore] Updated issues count:', updated.length);
      return { issues: updated };
    });
  },

  handleIssueDeleted: (payload) => {
    set((state) => ({
      issues: state.issues.filter((i) => i.id !== payload.id),
    }));
  },

  handleIssueLinked: (payload) => {
    // This could be used to update UI if needed
    console.log('Issue linked:', payload);
  },

  handleIssueUnlinked: (payload) => {
    // This could be used to update UI if needed
    console.log('Issue unlinked:', payload);
  },
}));
