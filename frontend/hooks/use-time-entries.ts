"use client";

import useSWR from 'swr';
import { 
  TimeEntryDTO, 
  ApiError, 
  fetcher,
  createTimeEntry as apiCreateTimeEntry,
  updateTimeEntry as apiUpdateTimeEntry,
  deleteTimeEntry as apiDeleteTimeEntry,
} from '@/lib/api';

export const timeEntriesApiKey = '/time-entries';
export const userTimeEntriesApiKey = (userId: number) => `/time-entries/user/${userId}`;

export interface UseTimeEntriesReturn {
  timeEntries: TimeEntryDTO[];
  isLoading: boolean;
  error: Error | null;
  createTimeEntry: (entry: TimeEntryDTO) => Promise<{ success: boolean; data?: TimeEntryDTO; error?: ApiError }>;
  updateTimeEntry: (id: number, entry: TimeEntryDTO) => Promise<{ success: boolean; data?: TimeEntryDTO; error?: ApiError }>;
  deleteTimeEntry: (id: number) => Promise<{ success: boolean; error?: ApiError }>;
  refresh: () => void;
}

export function useTimeEntries(userId?: number, role?: string): UseTimeEntriesReturn {
  // If user is Admin, fetch all time entries. Otherwise, fetch entries for the specific user.
  const isAdmin = role?.toLowerCase() === 'admin';
  const key = (isAdmin || !userId) ? timeEntriesApiKey : userTimeEntriesApiKey(userId);
  
  const { data, error, isLoading, mutate } = useSWR<TimeEntryDTO[]>(
    key,
    fetcher,
    {
      fallbackData: [],
      errorRetryCount: 3,
      revalidateOnFocus: true,
    }
  );

  const handleCreateTimeEntry = async (
    entry: TimeEntryDTO
  ): Promise<{ success: boolean; data?: TimeEntryDTO; error?: ApiError }> => {
    const result = await apiCreateTimeEntry(entry);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true, data: result.data };
  };

  const handleUpdateTimeEntry = async (
    id: number,
    entry: TimeEntryDTO
  ): Promise<{ success: boolean; data?: TimeEntryDTO; error?: ApiError }> => {
    const result = await apiUpdateTimeEntry(id, entry);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true, data: result.data };
  };

  const handleDeleteTimeEntry = async (
    id: number
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiDeleteTimeEntry(id);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  return {
    timeEntries: data || [],
    isLoading,
    error: error || null,
    createTimeEntry: handleCreateTimeEntry,
    updateTimeEntry: handleUpdateTimeEntry,
    deleteTimeEntry: handleDeleteTimeEntry,
    refresh: () => mutate(),
  };
}
