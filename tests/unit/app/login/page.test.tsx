import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

const pushMock = vi.fn();
const useAuthStoreMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: () => useAuthStoreMock(),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('lucide-react', () => ({
  Globe: () => <svg data-testid="google-icon" />,
}));

import LoginPage from '@/app/login/page';

type AuthState = {
  login: ReturnType<typeof vi.fn>;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const setAuthState = (overrides: Partial<AuthState> = {}) => {
  const state: AuthState = {
    login: vi.fn().mockResolvedValue(true),
    isAuthenticated: false,
    isLoading: false,
    ...overrides,
  };
  useAuthStoreMock.mockReturnValue(state);
  return state;
};

describe('login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to home when already authenticated', async () => {
    setAuthState({ isAuthenticated: true });

    render(<LoginPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows validation errors and failed login message', async () => {
    const state = setAuthState({ login: vi.fn().mockResolvedValue(false) });

    render(<LoginPage />);

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByText('Create an account')).toBeInTheDocument();

    const submitButtons = screen.getAllByRole('button', { name: 'Sign in' });
    fireEvent.click(submitButtons[0]);

    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret' } });
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(state.login).toHaveBeenCalledWith('john@example.com', 'secret');
    });
    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
  });

  it('renders loading state and submits Google auth form', () => {
    const state = setAuthState({ isLoading: true });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(<LoginPage />);

    const signInButtons = screen.getAllByRole('button', { name: 'Signing in…' });
    expect(signInButtons[0]).toBeDisabled();

    const googleButton = screen.getByRole('button', { name: 'Google' });
    fireEvent.click(googleButton);

    expect(errorSpy).toHaveBeenCalled();
    expect(state.login).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
