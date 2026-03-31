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

import RegisterPage from '@/app/register/page';

type AuthState = {
  register: ReturnType<typeof vi.fn>;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const setAuthState = (overrides: Partial<AuthState> = {}) => {
  const state: AuthState = {
    register: vi.fn().mockResolvedValue(true),
    isAuthenticated: false,
    isLoading: false,
    ...overrides,
  };
  useAuthStoreMock.mockReturnValue(state);
  return state;
};

describe('register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirects to home when already authenticated', async () => {
    setAuthState({ isAuthenticated: true });

    render(<RegisterPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows validation errors and duplicate-email message', async () => {
    const state = setAuthState({ register: vi.fn().mockResolvedValue(false) });

    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    expect(screen.getAllByText('Sign in').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Password must be at least 6 characters')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(state.register).toHaveBeenCalledWith('john@example.com', 'secret1', 'John Doe', 'user');
    });
    expect(await screen.findByText('An account with this email already exists.')).toBeInTheDocument();
  });

  it('renders loading submit state', () => {
    setAuthState({ isLoading: true });

    render(<RegisterPage />);

    const submitButton = screen.getByRole('button', { name: 'Creating account…' });
    expect(submitButton).toBeDisabled();
  });
});
