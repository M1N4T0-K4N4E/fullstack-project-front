import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import MyPostsPage from '@/app/my-posts/page';

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useState: vi.fn(actual.useState),
  };
});

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

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: { open: boolean; onOpenChange?: (v: boolean) => void; children: React.ReactNode }) => (
    open ? (
      <div>
        <button type="button" onClick={() => onOpenChange?.(false)}>dialog-close</button>
        {children}
      </div>
    ) : null
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ asChild, children, onClick, ...props }: { asChild?: boolean; children: React.ReactNode; onClick?: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    asChild ? <>{children}</> : <button type="button" onClick={onClick} {...props}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

describe('my posts page', () => {
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
  });

  it('redirects unauthenticated users to login and renders loading shell', async () => {
    authState = {
      ...authState,
      user: null,
      isAuthenticated: false,
      hasHydrated: true,
    };

    render(<MyPostsPage />);

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('renders empty state and creates a post', async () => {
    getMock.mockResolvedValue({ data: { data: [] } });
    postMock
      .mockResolvedValueOnce({ data: { postId: 'new-1' } })
      .mockResolvedValueOnce({ data: {} });

    render(<MyPostsPage />);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/api/posts/@me');
    });

    expect(screen.getByRole('heading', { name: 'My Posts' })).toBeInTheDocument();
    expect(screen.getByText('No posts yet')).toBeInTheDocument();
    expect(screen.getByText('Upload your first shader to get started.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /New Post/i }));
    expect(screen.getByRole('heading', { name: 'New Post' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('heading', { name: 'New Post' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /New Post/i }));
    expect(screen.getByRole('heading', { name: 'New Post' })).toBeInTheDocument();

    fireEvent.blur(screen.getByPlaceholderText('Enter post title…'));
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Enter post title…'), { target: { value: '  My First Post  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith('/api/posts', { body: { title: 'My First Post' } });
    });

    expect(pushMock).toHaveBeenCalledWith('/my-posts/new-1/edit');

    fireEvent.click(screen.getByRole('button', { name: /Create Post/i }));
    expect(screen.getByRole('heading', { name: 'New Post' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'dialog-close' }));
    expect(screen.queryByRole('heading', { name: 'New Post' })).not.toBeInTheDocument();
  });

  it('renders existing posts, opens edit link, and deletes selected post', async () => {
    getMock.mockResolvedValue({
      data: {
        data: [
          { id: 'p1', title: 'Post One', user: { name: 'Alice' }, thumbnail: '/thumb-1.png' },
          { id: 'p2', title: 'Post Two', user: { name: 'Alice' }, thumbnail: null },
          { id: null, title: null, user: null, thumbnail: null },
        ],
      },
    });

    deleteMock.mockResolvedValue({});

    render(<MyPostsPage />);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/api/posts/@me');
    });

    expect(screen.getByText('Post One')).toBeInTheDocument();
    expect(screen.getByText('Post Two')).toBeInTheDocument();
    expect(screen.getByText('3 shader(s) published')).toBeInTheDocument();
    expect(screen.getAllByText('Alice').length).toBeGreaterThan(0);

    const editLinks = screen.getAllByRole('link', { name: /Edit/i });
    expect(editLinks[0]).toHaveAttribute('href', '/my-posts/p1/edit');
    expect(editLinks.at(-1)).toHaveAttribute('href', '/my-posts//edit');

    fireEvent.click(screen.getAllByRole('button', { name: /Delete/i })[0]);
    expect(screen.getByRole('heading', { name: 'Delete Post' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' }).at(-1) as HTMLButtonElement);
    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith('/api/posts/{id}', { params: { path: { id: 'p1' } } });
    });

    await waitFor(() => {
      expect(screen.queryByText('Post One')).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Delete/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('heading', { name: 'Delete Post' })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Delete/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'dialog-close' }));
    expect(screen.queryByRole('heading', { name: 'Delete Post' })).not.toBeInTheDocument();
  });

  it('displays removed badge for in-session deleted state', async () => {
    const useStateMock = React.useState as unknown as ReturnType<typeof vi.fn>;
    const actualReact = await vi.importActual<typeof import('react')>('react');

    useStateMock.mockImplementationOnce(() => [
      [{ id: 'p1', title: 'Post One', authorName: 'Alice', removed: true, thumbnail: null }],
      vi.fn(),
    ]);
    getMock.mockResolvedValue({ data: { data: [] } });

    useStateMock.mockImplementationOnce(() => [true, vi.fn()]);
    useStateMock.mockImplementationOnce(() => [false, vi.fn()]);
    useStateMock.mockImplementationOnce(() => [null, vi.fn()]);

    render(<MyPostsPage />);

    expect(screen.getByText('Post One')).toBeInTheDocument();
    expect(screen.getByText('Removed')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument();

    useStateMock.mockReset();
    useStateMock.mockImplementation(actualReact.useState);
  });

});
