import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useToast } from './use-toast';

describe('useToast Notification State System', () => {
    it('should capture toast events and update dispatch collection stacks on execute operations', () => {
        const { result } = renderHook(() => useToast());

        // Send a message notice action down into the reducer pipelines
        act(() => {
            result.current.toast({
                title: 'Database Sync Completed',
                description: 'PostgreSQL connection strings verified successfully.',
            });
        });

        // Confirm array changes matched original actions
        expect(result.current.toasts.length).toBe(1);
        expect(result.current.toasts[0].title).toBe('Database Sync Completed');
    });

    it('should transparently clear target indicators when running a component tracking dismiss execution call', () => {
        const { result } = renderHook(() => useToast());

        let toastInstance: any = null;
        act(() => {
            toastInstance = result.current.toast({ title: 'Discardable Event Trace' });
        });

        act(() => {
            result.current.dismiss(toastInstance.id);
        });

        // An item running inside a dismiss lifecycle changes its open flag to false
        expect(result.current.toasts[0].open).toBe(false);
    });
});