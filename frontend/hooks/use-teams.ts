"use client";

import useSWR from 'swr';
import { 
  TeamResponseDTO, 
  TeamRequestDTO,
  ApiError, 
  teamsApiKey, 
  fetcher,
  createTeam as apiCreateTeam,
  updateTeam as apiUpdateTeam,
  deleteTeam as apiDeleteTeam,
  addTeamMember as apiAddTeamMember,
  removeTeamMember as apiRemoveTeamMember,
} from '@/lib/api';

export interface UseTeamsReturn {
  teams: TeamResponseDTO[];
  isLoading: boolean;
  error: Error | null;
  createTeam: (team: TeamRequestDTO) => Promise<{ success: boolean; data?: TeamResponseDTO; error?: ApiError }>;
  updateTeam: (id: number, team: TeamRequestDTO) => Promise<{ success: boolean; error?: ApiError }>;
  deleteTeam: (id: number) => Promise<{ success: boolean; error?: ApiError }>;
  addTeamMember: (teamId: number, userId: number) => Promise<{ success: boolean; error?: ApiError }>;
  removeTeamMember: (teamId: number, userId: number) => Promise<{ success: boolean; error?: ApiError }>;
  refresh: () => void;
}

export function useTeams(): UseTeamsReturn {
  const { data, error, isLoading, mutate } = useSWR<TeamResponseDTO[]>(
    teamsApiKey,
    fetcher,
    {
      fallbackData: [],
      errorRetryCount: 3,
      revalidateOnFocus: true,
    }
  );

  const handleCreateTeam = async (
    team: TeamRequestDTO
  ): Promise<{ success: boolean; data?: TeamResponseDTO; error?: ApiError }> => {
    const result = await apiCreateTeam(team);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true, data: result.data };
  };

  const handleUpdateTeam = async (
    id: number,
    team: TeamRequestDTO
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiUpdateTeam(id, team);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  const handleDeleteTeam = async (
    id: number
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiDeleteTeam(id);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  const handleAddTeamMember = async (
    teamId: number,
    userId: number
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiAddTeamMember(teamId, userId);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  const handleRemoveTeamMember = async (
    teamId: number,
    userId: number
  ): Promise<{ success: boolean; error?: ApiError }> => {
    const result = await apiRemoveTeamMember(teamId, userId);
    if (result.error) return { success: false, error: result.error };
    await mutate();
    return { success: true };
  };

  return {
    teams: data || [],
    isLoading,
    error: error || null,
    createTeam: handleCreateTeam,
    updateTeam: handleUpdateTeam,
    deleteTeam: handleDeleteTeam,
    addTeamMember: handleAddTeamMember,
    removeTeamMember: handleRemoveTeamMember,
    refresh: () => mutate(),
  };
}
