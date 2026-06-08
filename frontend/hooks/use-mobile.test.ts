import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useIsMobile } from './use-mobile';

describe('useIsMobile Custom Hook', () => {

    beforeEach(() => {
        // Reset the mock functions before each test so they don't leak into each other
        window.matchMedia = vi.fn().mockImplementation((query) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        }));
    });

    it('should correctly flag mobile layout visibility profiles based on screen width matching rules', () => {
        // The safe, guaranteed way to override read-only window properties in Vitest
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 500, // Mobile width
        });

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(true);
    });

    it('should evaluate false when media queries indicate a standard desktop workstation frame profile', () => {
        // Force the desktop width safely
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200, // Desktop width
        });

        const { result } = renderHook(() => useIsMobile());
        expect(result.current).toBe(false);
    });
});