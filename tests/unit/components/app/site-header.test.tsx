import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SiteHeader } from '@/components/app/site-header';

const pushMock = vi.fn();
const logoutMock = vi.fn();

let authState: {
  hasHydrated: boolean;
  isAuthenticated: boolean;
  user: { name: string; email: string; role: 'admin' | 'moderator' | 'user' } | null;
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock('avvvatars-react', () => ({
  default: () => <div data-testid="avvvatars" />,
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: () => ({
    ...authState,
    logout: logoutMock,
  }),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ asChild, children, ...props }: { asChild?: boolean; children: React.ReactNode }) =>
    asChild ? <>{children}</> : <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ asChild, children, onClick }: { asChild?: boolean; children: React.ReactNode; onClick?: () => void }) =>
    asChild ? <>{children}</> : <button onClick={onClick}>{children}</button>,
}));

describe('SiteHeader', () => {
  beforeEach(() => {
    pushMock.mockReset();
    logoutMock.mockReset();
    authState = {
      hasHydrated: true,
      isAuthenticated: false,
      user: null,
    };
  });

  it('shows a placeholder while auth store is not hydrated', () => {
    authState = {
      hasHydrated: false,
      isAuthenticated: false,
      user: null,
    };

    const { container } = render(<SiteHeader />);

    expect(screen.getByRole('link', { name: 'Discover' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Register' })).not.toBeInTheDocument();
    expect(container.querySelector('div.w-8.h-8')).toBeTruthy();
  });

  it('shows Sign in and Register for guests once hydrated', () => {
    render(<SiteHeader />);

    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument();
    expect(screen.queryByText('Sign out')).not.toBeInTheDocument();
  });

  it('shows admin and moderator links for an admin user and supports sign out', () => {
    authState = {
      hasHydrated: true,
      isAuthenticated: true,
      user: {
        name: 'Alice',
        email: 'alice@example.com',
        role: 'admin',
      },
    };

    render(<SiteHeader />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Admin Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Moderator Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'My Posts' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Account' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(logoutMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('shows moderator dashboard for moderator and hides admin dashboard', () => {
    authState = {
      hasHydrated: true,
      isAuthenticated: true,
      user: {
        name: 'Mod',
        email: 'mod@example.com',
        role: 'moderator',
      },
    };

    render(<SiteHeader />);

    expect(screen.queryByRole('link', { name: 'Admin Dashboard' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Moderator Dashboard' })).toBeInTheDocument();
  });

  it('hides both dashboard links for a normal user', () => {
    authState = {
      hasHydrated: true,
      isAuthenticated: true,
      user: {
        name: 'User',
        email: 'user@example.com',
        role: 'user',
      },
    };

    render(<SiteHeader />);

    expect(screen.queryByRole('link', { name: 'Admin Dashboard' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Moderator Dashboard' })).not.toBeInTheDocument();
  });
});
