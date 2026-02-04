import api from './api';
import { DashboardStats } from '../types/dashboard';

export const dashboardApi = {
  async getStats(projectId?: string): Promise<DashboardStats> {
    const params = projectId ? { projectId } : {};
    const response = await api.get<DashboardStats>('/dashboard/stats', { params });
    return response.data;
  },
};
