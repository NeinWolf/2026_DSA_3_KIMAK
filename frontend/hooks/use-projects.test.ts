import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useProjects } from './use-projects';
import * as api from '@/lib/api';

vi.mock('@/lib/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/api')>();
    return {
        ...actual,
        fetcher: vi.fn(),
        createProject: vi.fn(),
        updateProject: vi.fn(),
        deleteProject: vi.fn(),
    };
});

describe('useProjects Custom Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return default initial empty states', () => {
        const { result } = renderHook(() => useProjects());

        expect(result.current.projects).toEqual([]);
        expect(result.current.isLoading).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('should return success response when a project is created successfully', async () => {
        vi.mocked(api.createProject).mockResolvedValue({ success: true } as any);

        const { result } = renderHook(() => useProjects());

        let response;
        await act(async () => {
            response = await result.current.createProject({
                name: 'Inżynierka Rhythm Engine',
                description: 'Procedural level generation analysis suites',
                startDate: '2026-06-08',
                endDate: '2026-10-01',
            });
        });

        expect(response).toEqual({ success: true });
        expect(api.createProject).toHaveBeenCalledTimes(1);
    });
});