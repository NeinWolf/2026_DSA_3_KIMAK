import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Page from './page';

// Mock the child components to isolate the routing logic
vi.mock('@/components/login-page', () => ({
    default: () => <div data-testid="login-page">Mock Login Screen</div>
}));

vi.mock('@/components/time-tracking-layout', () => ({
    default: ({ currentUser }: any) => <div data-testid="main-layout">Welcome {currentUser.name}</div>
}));

describe('Root Page Entry Component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders the login page when no valid user session exists in localStorage', async () => {
        render(<Page />);

        // Wait for the restoration useEffect to finish
        await waitFor(() => {
            expect(screen.getByTestId('login-page')).toBeInTheDocument();
        });
        expect(screen.queryByTestId('main-layout')).not.toBeInTheDocument();
    });

    it('bypasses login and renders the main layout if a valid user session is stored', async () => {
        // Inject fake credentials into the virtual browser
        localStorage.setItem('token', 'header.eyJzdWIiOiJkZXZlbG9wZXIiLCJleHAiOjE4MDAwMDAwMDB9.signature');
        localStorage.setItem('user', JSON.stringify({ id: 1, name: 'Developer', role: 'admin' }));

        render(<Page />);

        // Verify it routes directly to the main layout
        await waitFor(() => {
            expect(screen.getByTestId('main-layout')).toBeInTheDocument();
            expect(screen.getByText('Welcome Developer')).toBeInTheDocument();
        });
    });
});