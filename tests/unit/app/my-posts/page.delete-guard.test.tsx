import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyPostsPage from '@/app/my-posts/page';

const pushMock = vi.fn();
const getMock = vi.fn();
const postMock = vi.fn();
const deleteMock = vi.fn();

let authState: {
  user: { name: string } | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  getAuthClient: () => {
    GET: typeof getMock;
    POST: typeof postMock;
    DELETE: typeof deleteMock;
  };
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
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

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
}));

// In this focused test, always render dialog content so we can click delete while deleteTarget is null.
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ asChild, children, onClick, ...props }: { asChild?: boolean; children: React.ReactNode; onClick?: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    asChild ? <>{children}</> : <button type="button" onClick={onClick} {...props}>{children}</button>,
  DropdownMenuSeparator: () => <hr />,
}));

describe('my posts delete guard', () => {
  beforeEach(() => {
    pushMock.mockReset();
    getMock.mockReset();
    postMock.mockReset();
    deleteMock.mockReset();

    authState = {
      user: { name: 'Alice' },
      isAuthenticated: true,
      hasHydrated: true,
      getAuthClient: () => ({ GET: getMock, POST: postMock, DELETE: deleteMock }),
    };

    getMock.mockResolvedValue({ data: { data: [] } });
  });

  it('returns early and does not call DELETE when deleteTarget is null', async () => {
    render(<MyPostsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'My Posts' })).toBeInTheDocument();
    });

    // This delete button belongs to delete confirmation footer in the always-rendered dialog mock.
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(deleteMock).not.toHaveBeenCalled();
  });
});
