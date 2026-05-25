"use client";

import useSWR from 'swr';
import { 
  TaskDTO, 
  ApiError, 
  fetcher,
  createTask as apiCreateTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '@/lib/api';

export const tasksApiKey = '/tasks';
export const projectTasksApiKey = (projectId: number) => `/tasks/project/${projectId}`;

export interface UseTasksReturn {
  tasks: TaskDTO[];
  isLoading: boolean;
  error: Error | null;
  createTask: (task: Omit<TaskDTO, 'id' | 'projectName' | 'assignedUsers'>) => Promise<{ success: boolean; error?: ApiError }>;
  updateTask: (id: number, task: Omit<TaskDTO, 'id' | 'projectName' | 'assignedUsers'>) => Promise<{ success: boolean; error?: ApiError }>;
  deleteTask: (id: number) => Promise<{ success: boolean; error?: ApiError }>;
  refresh: () => void;
}

export function useTasks(projectId?: number): UseTasksReturn {
  const key = projectId ? projectTasksApiKey(projectId) : tasksApiKey;
  
  const { data, error, isLoading, mutate } = useSWR<TaskDTO[]>(
    key,
    fetcher,
    {
      fallbackData: [],
      errorRetryCount: 3,
      revalidateOnFocus: true,
    }
  );

  const handleCreateTask = async (
    task: Omit<TaskDTO, 'id' | 'projectName' | 'assignedUsers'>
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiCreateTask(task);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  const handleUpdateTask = async (
    id: number,
    task: Omit<TaskDTO, 'id' | 'projectName' | 'assignedUsers'>
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiUpdateTask(id, task);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  const handleDeleteTask = async (
    id: number
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiDeleteTask(id);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  return {
    tasks: data || [],
    isLoading,
    error: error || null,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    refresh: () => mutate(),
  };
}
