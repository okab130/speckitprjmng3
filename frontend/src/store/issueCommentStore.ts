import { create } from 'zustand';
import { IssueComment, CreateIssueCommentInput, UpdateIssueCommentInput } from '../types/issueComment';
import api from '../lib/api';

interface IssueCommentState {
  comments: Record<string, IssueComment[]>; // issueId -> comments[]
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchComments: (issueId: string) => Promise<void>;
  createComment: (issueId: string, data: CreateIssueCommentInput) => Promise<IssueComment>;
  updateComment: (issueId: string, commentId: string, data: UpdateIssueCommentInput) => Promise<IssueComment>;
  deleteComment: (issueId: string, commentId: string) => Promise<void>;
  
  // WebSocket handlers
  handleCommentCreated: (comment: IssueComment & { issueId: string }) => void;
  handleCommentUpdated: (comment: IssueComment & { issueId: string }) => void;
  handleCommentDeleted: (payload: { id: string; issueId: string }) => void;
}

export const useIssueCommentStore = create<IssueCommentState>((set, get) => ({
  comments: {},
  loading: false,
  error: null,

  // Fetch all comments for an issue
  fetchComments: async (issueId) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get(`/issues/${issueId}/comments`);
      set((state) => ({
        comments: {
          ...state.comments,
          [issueId]: response.data,
        },
        loading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to fetch comments',
        loading: false 
      });
      throw error;
    }
  },

  // Create a new comment
  createComment: async (issueId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post(`/issues/${issueId}/comments`, data);
      const newComment = response.data;
      
      // Optimistically add to state
      set((state) => ({
        comments: {
          ...state.comments,
          [issueId]: [...(state.comments[issueId] || []), newComment],
        },
        loading: false,
      }));
      
      return newComment;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to create comment',
        loading: false 
      });
      throw error;
    }
  },

  // Update a comment
  updateComment: async (issueId, commentId, data) => {
    set({ loading: true, error: null });
    try {
      const response = await api.patch(`/issues/${issueId}/comments/${commentId}`, data);
      const updatedComment = response.data;
      
      // Update in state
      set((state) => ({
        comments: {
          ...state.comments,
          [issueId]: (state.comments[issueId] || []).map((comment) =>
            comment.id === commentId ? updatedComment : comment
          ),
        },
        loading: false,
      }));
      
      return updatedComment;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to update comment',
        loading: false 
      });
      throw error;
    }
  },

  // Delete a comment
  deleteComment: async (issueId, commentId) => {
    set({ loading: true, error: null });
    try {
      await api.delete(`/issues/${issueId}/comments/${commentId}`);
      
      // Remove from state
      set((state) => ({
        comments: {
          ...state.comments,
          [issueId]: (state.comments[issueId] || []).filter((comment) => comment.id !== commentId),
        },
        loading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Failed to delete comment',
        loading: false 
      });
      throw error;
    }
  },

  // WebSocket event handlers
  handleCommentCreated: (comment) => {
    const { issueId, ...commentData } = comment;
    set((state) => {
      const existingComments = state.comments[issueId] || [];
      
      // Avoid duplicates
      if (existingComments.some((c) => c.id === commentData.id)) {
        return state;
      }
      
      return {
        comments: {
          ...state.comments,
          [issueId]: [...existingComments, commentData as IssueComment],
        },
      };
    });
  },

  handleCommentUpdated: (comment) => {
    const { issueId, ...commentData } = comment;
    set((state) => ({
      comments: {
        ...state.comments,
        [issueId]: (state.comments[issueId] || []).map((c) =>
          c.id === commentData.id ? (commentData as IssueComment) : c
        ),
      },
    }));
  },

  handleCommentDeleted: (payload) => {
    const { id, issueId } = payload;
    set((state) => ({
      comments: {
        ...state.comments,
        [issueId]: (state.comments[issueId] || []).filter((c) => c.id !== id),
      },
    }));
  },
}));
