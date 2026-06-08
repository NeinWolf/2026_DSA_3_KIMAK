import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUsers } from './use-users';
import * as api from '@/lib/api';

vi.mock('@/lib/api', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@/lib/api')>();
    return {
        ...actual,
        fetcher: vi.fn(),
        createUser: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
    };
});

describe('useUsers Custom Hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should supply default user tracking structures on load', () => {
        const { result } = renderHook(() => useUsers());

        expect(result.current.users).toEqual([]);
        expect(result.current.isLoading).toBe(true);
    });

    it('should bubble up clean success validations when creating active user assignments', async () => {
        vi.mocked(api.createUser).mockResolvedValue({ success: true } as any);

        const { result } = renderHook(() => useUsers());

        let response;
        await act(async () => {
            response = await result.current.createUser({
                username: 'team_lead_natan',
                role: 'ADMIN',
            });
        });

        expect(response).toEqual({ success: true });
        expect(api.createUser).toHaveBeenCalledTimes(1);
    });
});