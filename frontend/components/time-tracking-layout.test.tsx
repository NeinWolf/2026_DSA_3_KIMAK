import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimeTrackingLayout from './time-tracking-layout';

// Mock the custom hooks so the component renders cleanly without real API data
vi.mock('@/hooks/use-projects', () => ({
    useProjects: () => ({ projects: [], isLoading: false, error: null, refresh: vi.fn() })
}));
vi.mock('@/hooks/use-tasks', () => ({
    useTasks: () => ({ tasks: [], isLoading: false, error: null, refresh: vi.fn() })
}));
vi.mock('@/hooks/use-users', () => ({
    useUsers: () => ({ users: [], isLoading: false, error: null, refresh: vi.fn() })
}));

describe('TimeTrackingLayout Component', () => {
    const mockUser = {
        id: 1,
        name: 'Test Administrator',
        email: 'admin@test.com',
        initials: 'TA',
        role: 'admin' as const,
        team: 'Frontend'
    };

    const mockLogout = vi.fn();

    it('renders the sidebar and defaults to the Dashboard view on load', () => {
        render(<TimeTrackingLayout currentUser={mockUser} onLogout={mockLogout} />);

        // Check sidebar navigation links
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Projekty i Zadania')).toBeInTheDocument();

        // Check main view title (Admin specific because we passed role: admin)
        expect(screen.getByText('Dashboard Administratora')).toBeInTheDocument();
    });

    it('switches the active view when sidebar navigation buttons are clicked', () => {
        render(<TimeTrackingLayout currentUser={mockUser} onLogout={mockLogout} />);

        // Find the Projects button in the sidebar and click it
        const projectsNavButton = screen.getByText('Projekty i Zadania');
        fireEvent.click(projectsNavButton);

        // The main screen should update to show the Projects view descriptions
        expect(screen.getByText('Tworzenie i zarzadzanie projektami oraz zadaniami.')).toBeInTheDocument();
    });
});