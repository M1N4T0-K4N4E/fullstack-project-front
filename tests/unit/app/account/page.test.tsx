import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import React from 'react';

const pushMock = vi.fn();
const useAuthStoreMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: () => useAuthStoreMock(),
}));

vi.mock('@/components/app/site-header', () => ({
  SiteHeader: () => <header data-testid="site-header">Header</header>,
}));

vi.mock('@/components/app/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  AvatarFallback: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
}));

vi.mock('lucide-react', () => ({
  PencilIcon: () => <svg data-testid="pencil-icon" />,
  CheckIcon: () => <svg data-testid="check-icon" />,
  XIcon: () => <svg data-testid="x-icon" />,
}));

vi.mock('avvvatars-react', () => ({
  default: () => <div data-testid="avatar" />,
}));

import AccountPage from '@/app/account/page';

type AuthState = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  } | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  logout: ReturnType<typeof vi.fn>;
  updateProfile: ReturnType<typeof vi.fn>;
};

const baseUser = {
  id: 'u-1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin',
  createdAt: '2024-01-02T00:00:00.000Z',
};

const setAuthState = (overrides: Partial<AuthState> = {}) => {
  const state: AuthState = {
    user: baseUser,
    isAuthenticated: true,
    hasHydrated: true,
    logout: vi.fn(),
    updateProfile: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  useAuthStoreMock.mockReturnValue(state);
  return state;
};

describe('account page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when hydration/auth/user are not ready', () => {
    setAuthState({ hasHydrated: false, isAuthenticated: false, user: null });

    render(<AccountPage />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('redirects to home when hydrated but unauthenticated', async () => {
    setAuthState({ hasHydrated: true, isAuthenticated: false, user: null });

    render(<AccountPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders account details and supports editing and logout flows', async () => {
    const state = setAuthState();

    render(<AccountPage />);

    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
    expect(screen.getAllByText('john@example.com').length).toBeGreaterThan(0);
    expect(screen.getByText('Member since January 2, 2024')).toBeInTheDocument();
    expect(screen.getByText('u-1')).toBeInTheDocument();
    expect(screen.getAllByText('admin').length).toBeGreaterThan(0);

    const displayNameRow = screen.getByText('Display name').closest('div');
    expect(displayNameRow).not.toBeNull();
    fireEvent.click(within(displayNameRow as HTMLElement).getByRole('button'));

    const nameInput = screen.getByRole('textbox', { name: '' });
    expect(nameInput).toHaveValue('John Doe');

    fireEvent.keyDown(nameInput, { key: 'Escape' });
    expect(screen.queryByDisplayValue('John Doe')).not.toBeInTheDocument();

    fireEvent.click(within(displayNameRow as HTMLElement).getByRole('button'));
    const reopenedNameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(reopenedNameInput, { target: { value: 'Jane Doe' } });
    fireEvent.submit(reopenedNameInput.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(state.updateProfile).toHaveBeenCalledWith({ name: 'Jane Doe' });
    });

    const emailRow = screen.getByText('Email').closest('div');
    expect(emailRow).not.toBeNull();
    fireEvent.click(within(emailRow as HTMLElement).getByRole('button'));

    const emailInput = screen.getByDisplayValue('john@example.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    fireEvent.submit(emailInput.closest('form') as HTMLFormElement);

    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.submit(emailInput.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(state.updateProfile).toHaveBeenCalledWith({ email: 'new@example.com' });
    });

    fireEvent.click(within(emailRow as HTMLElement).getByRole('button'));
    const reopenedEmailInput = screen.getByDisplayValue('john@example.com');
    const form = reopenedEmailInput.closest('form') as HTMLFormElement;
    const buttons = within(form).getAllByRole('button');
    fireEvent.click(buttons[1]);
    expect(screen.queryByDisplayValue('john@example.com')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(state.logout).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/');
  });
});
