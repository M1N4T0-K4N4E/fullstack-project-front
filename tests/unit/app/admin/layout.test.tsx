import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminLayout from '@/app/admin/layout';

const pushMock = vi.fn();
let pathnameMock = '/admin';
let authState: { hasHydrated: boolean; isAuthenticated: boolean; user: { role: string } | null } = {
  hasHydrated: true,
  isAuthenticated: true,
  user: { role: 'admin' },
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock,
}));

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: () => authState,
}));

vi.mock('@/components/app/site-header', () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}));

vi.mock('@/components/app/footer', () => ({
  Footer: () => <div data-testid="footer" />,
}));

vi.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div data-testid="scroll-area">{children}</div>,
}));

vi.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar-provider">{children}</div>,
  Sidebar: ({ children }: { children: React.ReactNode }) => <aside>{children}</aside>,
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuButton: ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) => (asChild ? <>{children}</> : <button>{children}</button>),
}));

vi.mock('@/components/ui/breadcrumb', () => ({
  Breadcrumb: ({ children }: { children: React.ReactNode }) => <nav>{children}</nav>,
  BreadcrumbList: ({ children }: { children: React.ReactNode }) => <ol>{children}</ol>,
  BreadcrumbItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  BreadcrumbLink: ({ asChild, children }: { asChild?: boolean; children: React.ReactNode }) => (asChild ? <>{children}</> : <span>{children}</span>),
  BreadcrumbSeparator: ({ children }: { children?: React.ReactNode }) => <span data-testid="breadcrumb-separator">{children ?? '/'}</span>,
  BreadcrumbPage: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe('admin layout', () => {
  beforeEach(() => {
    pushMock.mockReset();
    pathnameMock = '/admin';
    authState = {
      hasHydrated: true,
      isAuthenticated: true,
      user: { role: 'admin' },
    };
  });

  it('shows loading shell before hydration', () => {
    authState = {
      hasHydrated: false,
      isAuthenticated: false,
      user: null,
    };

    render(
      <AdminLayout>
        <div>child</div>
      </AdminLayout>,
    );

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('redirects unauthorized users and keeps loading state', async () => {
    authState = {
      hasHydrated: true,
      isAuthenticated: true,
      user: { role: 'moderator' },
    };

    render(
      <AdminLayout>
        <div>child</div>
      </AdminLayout>,
    );

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/');
    });
  });

  it('renders admin shell and root breadcrumb for overview route', () => {
    pathnameMock = '/admin';

    render(
      <AdminLayout>
        <div data-testid="child">overview child</div>
      </AdminLayout>,
    );

    expect(screen.getByTestId('sidebar-provider')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');
    expect(screen.queryByTestId('breadcrumb-separator')).not.toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/admin/users');
    expect(screen.getByRole('link', { name: 'Activity' })).toHaveAttribute('href', '/admin/activity');
    expect(screen.getByRole('link', { name: 'Posts' })).toHaveAttribute('href', '/admin/posts');
    expect(screen.getByTestId('child')).toHaveTextContent('overview child');
  });

  it('renders non-root breadcrumb when route matches nested nav', () => {
    pathnameMock = '/admin/activity';

    render(
      <AdminLayout>
        <div>activity child</div>
      </AdminLayout>,
    );

    expect(screen.getAllByText('Activity')).toHaveLength(2);
    expect(screen.getByTestId('breadcrumb-separator')).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });
});
