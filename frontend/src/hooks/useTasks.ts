import { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import { getWebSocketClient } from '../lib/websocket';
import { Task, CreateTaskInput, UpdateTaskInput, TaskSearchFilters } from '../types/task';

interface WebSocketEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

/**
 * Custom hook for task management with WebSocket real-time updates
 */
export const useTasks = (autoFetch: boolean = true, filters?: TaskSearchFilters) => {
  const {
    tasks,
    selectedTask,
    isLoading,
    error,
    fetchTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    setSelectedTask,
    clearError,
    handleTaskCreated,
    handleTaskUpdated,
    handleTaskDeleted,
  } = useTaskStore();

  // Fetch tasks on mount
  useEffect(() => {
    if (autoFetch) {
      fetchTasks(filters);
    }
  }, [autoFetch, filters]);

  // Set up WebSocket listeners for real-time updates
  useEffect(() => {
    const socket = getWebSocketClient();
    
    if (!socket) {
      console.warn('WebSocket not initialized');
      return;
    }

    const handleTaskCreatedEvent = (event: WebSocketEvent) => {
      console.log('Task created event received:', event.payload);
      handleTaskCreated(event.payload as Task);
    };

    const handleTaskUpdatedEvent = (event: WebSocketEvent) => {
      console.log('Task updated event received:', event.payload);
      handleTaskUpdated(event.payload as Task);
    };

    const handleTaskDeletedEvent = (event: WebSocketEvent) => {
      console.log('Task deleted event received:', event.payload);
      handleTaskDeleted(event.payload.id);
    };

    // Register event listeners
    socket.on('task:created', handleTaskCreatedEvent);
    socket.on('task:updated', handleTaskUpdatedEvent);
    socket.on('task:deleted', handleTaskDeletedEvent);

    // Cleanup listeners on unmount
    return () => {
      socket.off('task:created', handleTaskCreatedEvent);
      socket.off('task:updated', handleTaskUpdatedEvent);
      socket.off('task:deleted', handleTaskDeletedEvent);
    };
  }, [handleTaskCreated, handleTaskUpdated, handleTaskDeleted]);

  // Wrapper functions with error handling
  const createTaskWithErrorHandling = async (data: CreateTaskInput) => {
    try {
      return await createTask(data);
    } catch (error: any) {
      console.error('Create task failed:', error);
      throw error;
    }
  };

  const updateTaskWithErrorHandling = async (id: string, data: UpdateTaskInput) => {
    try {
      return await updateTask(id, data);
    } catch (error: any) {
      console.error('Update task failed:', error);
      throw error;
    }
  };

  const deleteTaskWithErrorHandling = async (id: string) => {
    try {
      await deleteTask(id);
    } catch (error: any) {
      console.error('Delete task failed:', error);
      throw error;
    }
  };

  const refetch = () => {
    return fetchTasks(filters);
  };

  return {
    // State
    tasks,
    selectedTask,
    isLoading,
    error,

    // Actions
    fetchTasks,
    fetchTaskById,
    createTask: createTaskWithErrorHandling,
    updateTask: updateTaskWithErrorHandling,
    deleteTask: deleteTaskWithErrorHandling,
    setSelectedTask,
    clearError,
    refetch,
  };
};
