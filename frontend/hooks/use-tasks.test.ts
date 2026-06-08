import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from './use-tasks';
import * as api from '@/lib/api';

// Mock the API layer entirely
vi.mock('@/lib/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/api')>();
    return {
        ...actual,
        fetcher: vi.fn(),
        createTask: vi.fn(),
        updateTask: vi.fn(),
        deleteTask: vi.fn(),
    };
});

describe('useTasks Custom Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return initial empty task state and default loading states', () => {
        const { result } = renderHook(() => useTasks());

        expect(result.current.tasks).toEqual([]);
        expect(result.current.isLoading).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('should trigger the API layer and return success when creating a task', async () => {
        vi.mocked(api.createTask).mockResolvedValue({ success: true } as any);

        const { result } = renderHook(() => useTasks());

        let response;
        await act(async () => {
            response = await result.current.createTask({
                projectId: 1,
                name: 'Build Frontend Framework Suite',
                description: 'Set up vitest engine templates',
                status: 'TODO',
                assignedUserIds: [],
            });
        });

        expect(response).toEqual({ success: true });
        expect(api.createTask).toHaveBeenCalledTimes(1);
    });
});