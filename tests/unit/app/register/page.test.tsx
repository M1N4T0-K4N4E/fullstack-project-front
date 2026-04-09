import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { createHash } from 'node:crypto';

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

vi.mock('zxcvbn', () => ({
  default: vi.fn((password: string) => {
    if (password === 'weak') return { score: 0 };
    if (password === 'VeryStrongPassword#123') return { score: 4 };
    return { score: 2 };
  }),
}));

import RegisterPage from '@/app/register/page';

type AuthState = {
  register: ReturnType<typeof vi.fn>;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const setAuthState = (overrides: Partial<AuthState> = {}) => {
  const state: AuthState = {
    register: vi.fn().mockResolvedValue(null),
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

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => '',
      } as Response)
    );
  });

  it('redirects to home when already authenticated', async () => {
    setAuthState({ isAuthenticated: true });

    render(<RegisterPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('shows validation errors and duplicate-email message', async () => {
    const duplicateEmailError = 'An account with this email already exists.';
    const state = setAuthState({ register: vi.fn().mockResolvedValue(duplicateEmailError) });

    render(<RegisterPage />);

    expect(screen.getByRole('heading', { name: 'Create an account' })).toBeInTheDocument();
    expect(screen.getAllByText('Sign in').length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect((await screen.findAllByText('Invalid input: expected string, received undefined')).length).toBeGreaterThan(0);
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    expect(screen.getAllByText('Invalid input: expected string, received undefined').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Password must be at least 15 characters')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'SecretPassword#123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => {
      expect(state.register).toHaveBeenCalledWith('john@example.com', 'SecretPassword#123', 'John Doe', 'user');
    });
    expect(await screen.findByText(duplicateEmailError)).toBeInTheDocument();
  });

  it('shows a password strength meter while typing', async () => {
    setAuthState();

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'weak' } });
    expect(await screen.findByText(/Strength:/)).toBeInTheDocument();
    expect(screen.getByText('Very weak')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'VeryStrongPassword#123' } });
    expect(await screen.findByText('Very strong')).toBeInTheDocument();
  });

  it('blocks submit when password is found in breach database', async () => {
    const state = setAuthState();
    const password = 'VeryStrongPassword#123';
    const hash = createHash('sha1').update(password).digest('hex').toUpperCase();
    const suffix = hash.slice(5);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => `${suffix}:42`,
    } as Response);

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText('Your name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: password } });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Password has been found in a data breach. Choose a different password.')).toBeInTheDocument();
    expect(state.register).not.toHaveBeenCalled();
  });

  it('renders loading submit state', () => {
    setAuthState({ isLoading: true });

    render(<RegisterPage />);

    const submitButton = screen.getByRole('button', { name: 'Creating account…' });
    expect(submitButton).toBeDisabled();
  });
});
