import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('Utility: cn()', () => {
    it('merges standard class names correctly', () => {
        expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    });

    it('resolves Tailwind conflicts using tailwind-merge', () => {
        // If we pass two background colors, the last one should win
        expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
        // If we pass padding X/Y and then padding ALL, padding ALL should win
        expect(cn('px-2 py-1', 'p-4')).toBe('p-4');
    });

    it('handles conditional classes via clsx', () => {
        // Simulates boolean logic often used in React components
        expect(cn('base-class', true && 'active', false && 'hidden')).toBe('base-class active');
    });
});