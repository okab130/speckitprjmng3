import { create } from 'zustand';
import axios from 'axios';
import { User } from '../types/user';

const API_BASE_URL = '/api';

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
      const token = localStorage.getItem('token');
      const response = await axios.get<User[]>(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ users: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.error || 'Failed to fetch users', isLoading: false });
      throw error;
    }
  },
}));
