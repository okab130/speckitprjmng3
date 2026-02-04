import { create } from 'zustand';
import api from '../lib/api';
import { User } from '../types/user';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  
  fetchUsers: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      console.log('[UserStore] Fetching users...');
      const response = await api.get<User[]>('/users');
      console.log('[UserStore] Users fetched:', response.data);
      set({ users: response.data, isLoading: false });
    } catch (error: any) {
      console.error('[UserStore] Failed to fetch users:', error);
      set({ error: error.response?.data?.error || 'Failed to fetch users', isLoading: false });
      throw error;
    }
  },
}));
