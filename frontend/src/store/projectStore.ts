import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { Project, CreateProjectInput, UpdateProjectInput, ProjectSearchFilters } from '../types/project';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  currentProjectId: string | null; // Currently active project for filtering
  isLoading: boolean;
  error: string | null;
  
  // CRUD actions
  fetchProjects: (filters?: ProjectSearchFilters) => Promise<void>;
  fetchProjectById: (id: string) => Promise<Project>;
  createProject: (data: CreateProjectInput) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectInput) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
  
  // UI state management
  setSelectedProject: (project: Project | null) => void;
  setCurrentProjectId: (projectId: string | null) => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      selectedProject: null,
      currentProjectId: null,
      isLoading: false,
      error: null,

      fetchProjects: async (filters?: ProjectSearchFilters) => {
        set({ isLoading: true, error: null });
        try {
          const cleanFilters = filters ? Object.fromEntries(
            Object.entries(filters).filter(([_, v]) => v !== undefined && v !== null && v !== '')
          ) : {};
          
          const response = await api.get<Project[]>('/projects', { params: cleanFilters });
          set({ projects: response.data, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch projects',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchProjectById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get<Project>(`/projects/${id}`);
          set({ selectedProject: response.data, isLoading: false });
          return response.data;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to fetch project',
            isLoading: false,
          });
          throw error;
        }
      },

      createProject: async (data: CreateProjectInput) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<Project>('/projects', data);
          const newProject = response.data;
          
          set((state) => ({
            projects: [newProject, ...state.projects],
            isLoading: false,
          }));
          
          return newProject;
        } catch (error: any) {
          set({
            error: error.response?.data?.error || 'Failed to create project',
            isLoading: false,
          });
          throw error;
        }
      },

      updateProject: async (id: string, data: UpdateProjectInput) => {
        set({ isLoading: true, error: null });
        
        const originalProjects = get().projects;
        
        // Optimistic update
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...data, version: data.version + 1 } : project
          ),
        }));
        
        try {
          const response = await api.patch<Project>(`/projects/${id}`, data);
          const updatedProject = response.data;
          
          set((state) => ({
            projects: state.projects.map((project) => (project.id === id ? updatedProject : project)),
            selectedProject: state.selectedProject?.id === id ? updatedProject : state.selectedProject,
            isLoading: false,
          }));
          
          return updatedProject;
        } catch (error: any) {
          // Rollback on error
          set({
            projects: originalProjects,
            error: error.response?.data?.error || 'Failed to update project',
            isLoading: false,
          });
          throw error;
        }
      },

      deleteProject: async (id: string) => {
        set({ isLoading: true, error: null });
        
        const originalProjects = get().projects;
        
        // Optimistic update
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        }));
        
        try {
          await api.delete(`/projects/${id}`);
          
          // If deleted project was current, clear it
          if (get().currentProjectId === id) {
            set({ currentProjectId: null });
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          // Rollback on error
          set({
            projects: originalProjects,
            error: error.response?.data?.error || 'Failed to delete project',
            isLoading: false,
          });
          throw error;
        }
      },

      setSelectedProject: (project: Project | null) => {
        set({ selectedProject: project });
      },

      setCurrentProjectId: (projectId: string | null) => {
        set({ currentProjectId: projectId });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'project-storage',
      partialize: (state) => ({ currentProjectId: state.currentProjectId }), // Only persist current project
    }
  )
);
