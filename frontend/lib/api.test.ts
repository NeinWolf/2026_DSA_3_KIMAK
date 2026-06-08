import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as api from './api';

describe('API Service Layer', () => {
    beforeEach(() => {
        // Mock the global browser fetch function
        global.fetch = vi.fn();
        // Mock the browser's localStorage
        Storage.prototype.getItem = vi.fn(() => 'fake-jwt-token');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('attaches the Authorization header automatically when a token is in localStorage', async () => {
        // Arrange: Create a fake successful HTTP response
        const mockResponse = {
            ok: true,
            status: 200,
            json: async () => ([{ id: 1, name: 'Test Project' }])
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        // Act: Call the getProjects endpoint
        await api.getProjects();

        // Assert: Verify fetch was called with the correct headers
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/projects'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer fake-jwt-token',
                    'Content-Type': 'application/json'
                })
            })
        );
    });

    it('catches HTTP failures and returns a cleanly mapped error object', async () => {
        // Arrange: Create a fake 404 HTTP error response
        const mockResponse = {
            ok: false,
            status: 404,
            json: async () => ({ message: 'Project Not Found' })
        };
        (global.fetch as any).mockResolvedValue(mockResponse);

        // Act
        const result = await api.getProject(999);

        // Assert: Verify the custom ApiError format is returned
        expect(result.data).toBeUndefined();
        expect(result.error).toEqual({
            status: 404,
            message: 'Project Not Found',
            errors: undefined
        });
    });
});