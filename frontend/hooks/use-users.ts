"use client";

import useSWR from 'swr';
import { 
  UserDTO, 
  ApiError, 
  fetcher,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deleteUser as apiDeleteUser,
} from '@/lib/api';

export const usersApiKey = '/users';

export interface UseUsersReturn {
  users: UserDTO[];
  isLoading: boolean;
  error: Error | null;
  createUser: (user: Omit<UserDTO, 'id'>) => Promise<{ success: boolean; error?: ApiError }>;
  updateUser: (id: number, user: Omit<UserDTO, 'id'>) => Promise<{ success: boolean; error?: ApiError }>;
  deleteUser: (id: number) => Promise<{ success: boolean; error?: ApiError }>;
  refresh: () => void;
}

export function useUsers(): UseUsersReturn {
  const { data, error, isLoading, mutate } = useSWR<UserDTO[]>(
    usersApiKey,
    fetcher,
    {
      fallbackData: [],
      errorRetryCount: 3,
      revalidateOnFocus: true,
    }
  );

  const handleCreateUser = async (
    user: Omit<UserDTO, 'id'>
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiCreateUser(user);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  const handleUpdateUser = async (
    id: number,
    user: Omit<UserDTO, 'id'>
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiUpdateUser(id, user);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  const handleDeleteUser = async (
    id: number
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiDeleteUser(id);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  return {
    users: data || [],
    isLoading,
    error: error || null,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    refresh: () => mutate(),
  };
}
