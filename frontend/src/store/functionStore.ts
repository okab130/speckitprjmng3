import { create } from 'zustand';
import api from '../lib/api';
import { Function, CreateFunctionDto } from '../types/function';

interface FunctionState {
  functions: Function[];
  systems: string[];
  isLoading: boolean;
  error: string | null;
  
  fetchFunctions: () => Promise<void>;
  fetchSystems: () => Promise<void>;
  createFunction: (data: CreateFunctionDto) => Promise<Function>;
  deleteFunction: (id: string) => Promise<void>;
}

export const useFunctionStore = create<FunctionState>((set, get) => ({
  functions: [],
  systems: [],
  isLoading: false,
  error: null,

  fetchFunctions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Function[]>('/functions');
      set({ functions: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch functions', isLoading: false });
      throw error;
    }
  },

  fetchSystems: async () => {
    try {
      const response = await api.get<string[]>('/functions/systems');
      set({ systems: response.data });
    } catch (error: any) {
      console.error('Failed to fetch systems:', error);
      throw error;
    }
  },

  createFunction: async (data: CreateFunctionDto) => {
    try {
      const response = await api.post<Function>('/functions', data);
      set({ functions: [...get().functions, response.data] });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  deleteFunction: async (id: string) => {
    try {
      await api.delete(`/functions/${id}`);
      set({ functions: get().functions.filter(f => f.id !== id) });
    } catch (error: any) {
      throw error;
    }
  },
}));
