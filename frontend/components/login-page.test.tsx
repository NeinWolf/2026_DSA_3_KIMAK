import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './login-page';
import * as api from '@/lib/api';

// 1. Intercept the API layer so we don't send real HTTP requests
vi.mock('@/lib/api', () => ({
    login: vi.fn(),
}));

describe('LoginPage Component', () => {
    // A "spy" function to check if our component successfully calls onLogin
    const mockOnLogin = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear(); // Wipe virtual browser memory before each test
    });

    it('renders the login form inputs and submit button properly', () => {
        render(<LoginPage onLogin={mockOnLogin} />);

        // Search the screen for elements exactly how a user sees them
        expect(screen.getByPlaceholderText('test_user')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Zaloguj się/i })).toBeInTheDocument();
    });

    it('shows a validation error if fields are left completely empty on submit', async () => {
        render(<LoginPage onLogin={mockOnLogin} />);

        // Grab the actual form element instead of just the button
        const form = screen.getByPlaceholderText('test_user').closest('form');

        // Simulate a direct form submission to bypass HTML5 'required' blockers
        fireEvent.submit(form!);

        // Assert that the UI reacted by displaying the warning text
        expect(screen.getByText('Wprowadź nazwę użytkownika i hasło')).toBeInTheDocument();
        expect(mockOnLogin).not.toHaveBeenCalled(); // The login process should halt
    });

    it('calls the login API and triggers onLogin upon successful authentication', async () => {
        // Arrange: Tell the mocked API to return a successful backend response
        vi.mocked(api.login).mockResolvedValue({
            data: { token: 'fake-jwt-token', id: 99, username: 'natan', role: 'admin' },
        });

        render(<LoginPage onLogin={mockOnLogin} />);

        // Act: Simulate a user typing in their credentials
        fireEvent.change(screen.getByPlaceholderText('test_user'), { target: { value: 'natan' } });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /Zaloguj się/i }));

        // Assert: Wait for the async API promise to resolve and check the state changes
        await waitFor(() => {
            expect(api.login).toHaveBeenCalledWith({ username: 'natan', password: 'password123' });

            // Ensure the component successfully passed the mapped user object to the parent
            expect(mockOnLogin).toHaveBeenCalledWith(expect.objectContaining({
                name: 'natan',
                role: 'admin',
            }));

            // Ensure the JWT was saved to the virtual browser storage
            expect(localStorage.getItem('token')).toBe('fake-jwt-token');
        });
    });
});