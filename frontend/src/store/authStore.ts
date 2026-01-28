import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { initializeWebSocket, disconnectWebSocket } from '../lib/websocket';
import { User, LoginInput, RegisterInput, AuthResponse } from '../types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (credentials: LoginInput) => {
        console.log('🔐 Login attempt:', credentials.email);
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        console.log('✅ Login response:', response.data);
        const { accessToken, refreshToken, user } = response.data;
        
        console.log('💾 Saving to localStorage:', { 
          accessToken: accessToken?.substring(0, 20) + '...', 
          hasRefreshToken: !!refreshToken,
          userName: user.name 
        });

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        console.log('✅ Auth state updated');

        // Initialize WebSocket connection
        initializeWebSocket(accessToken);
      },

      register: async (data: RegisterInput) => {
        const response = await api.post<AuthResponse>('/auth/register', data);
        const { accessToken, refreshToken, user } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });

        // Initialize WebSocket connection
        initializeWebSocket(accessToken);
      },

      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        disconnectWebSocket();

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      initialize: () => {
        const token = localStorage.getItem('accessToken');
        const user = localStorage.getItem('user');

        if (token && user) {
          set({
            accessToken: token,
            user: JSON.parse(user),
            isAuthenticated: true,
          });
          initializeWebSocket(token);
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
