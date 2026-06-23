"use client";

import useSWR from 'swr';
import { 
  ProjectDTO, 
  ApiError, 
  projectsApiKey, 
  fetcher,
  createProject,
  updateProject,
  deleteProject,
} from '@/lib/api';

export interface UseProjectsReturn {
  projects: ProjectDTO[];
  isLoading: boolean;
  error: Error | null;
  createProject: (project: Omit<ProjectDTO, 'id'>) => Promise<{ success: boolean; data?: ProjectDTO; error?: ApiError }>;
  updateProject: (id: number, project: Omit<ProjectDTO, 'id'>) => Promise<{ success: boolean; error?: ApiError }>;
  deleteProject: (id: number) => Promise<{ success: boolean; error?: ApiError }>;
  refresh: () => void;
}

export function useProjects(): UseProjectsReturn {
  const { data, error, isLoading, mutate } = useSWR<ProjectDTO[]>(
    projectsApiKey,
    fetcher,
    {
      // Fallback to empty array if API is not available
      fallbackData: [],
      // Retry on error
      errorRetryCount: 3,
      // Revalidate on focus
      revalidateOnFocus: true,
    }
  );

  const handleCreateProject = async (
    project: Omit<ProjectDTO, 'id'>
  ): Promise<{ success: boolean; data?: ProjectDTO; error?: ApiError }> => {
    const result = await createProject(project);
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    // Optimistically update the cache
    await mutate();
    return { success: true, data: result.data };
  };

  const handleUpdateProject = async (
    id: number,
    project: Omit<ProjectDTO, 'id'>
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await updateProject(id, project);
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    // Optimistically update the cache
    await mutate();
    return { success: true };
  };

  const handleDeleteProject = async (
    id: number
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await deleteProject(id);
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    // Optimistically update the cache
    await mutate();
    return { success: true };
  };

  return {
    projects: data || [],
    isLoading,
    error: error || null,
    createProject: handleCreateProject,
    updateProject: handleUpdateProject,
    deleteProject: handleDeleteProject,
    refresh: () => mutate(),
  };
}
