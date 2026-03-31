import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EditPostPage from '@/app/my-posts/[id]/edit/page';

const pushMock = vi.fn();

const getMock = vi.fn();
const putMock = vi.fn();

let authState: {
  user: { name: string } | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  getAuthClient: () => {
    GET: typeof getMock;
    PUT: typeof putMock;
  };
};

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ id: 'p-1' }),
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

vi.mock('@/components/app/tiptap-editor', () => ({
  TiptapEditor: ({ onChange }: { onChange: (v: string) => void }) => (
    <button type="button" onClick={() => onChange('Updated description')}>set-description</button>
  ),
}));

vi.mock('@/components/app/shader-editor', () => ({
  ShaderEditor: ({ name, onChange }: { name: string; onChange: (v: string) => void }) => (
    <button type="button" onClick={() => onChange(`${name}-updated`)}>{`set-${name}`}</button>
  ),
}));

vi.mock('@/components/app/ogl/ogl', () => ({
  OGL: () => <div data-testid="ogl-preview" />,
}));

vi.mock('@/components/app/ogl/store', () => ({
  OGLProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/app/ogl/shader', () => ({
  UNIFORMS: () => [],
  UNIFORM_DEFAULT: () => ({}),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ asChild, children, ...props }: { asChild?: boolean; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { disabled: _disabled, ...buttonProps } = props;
    return asChild ? <>{children}</> : <button {...buttonProps}>{children}</button>;
  },
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => <label {...props}>{children}</label>,
}));

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('edit post page', () => {
  beforeEach(() => {
    pushMock.mockReset();
    getMock.mockReset();
    putMock.mockReset();

    authState = {
      user: { name: 'Alice' },
      isAuthenticated: true,
      hasHydrated: true,
      getAuthClient: () => ({ GET: getMock, PUT: putMock }),
    };
  });

  it('redirects unauthenticated users to login and shows loading shell', async () => {
    authState = {
      ...authState,
      user: null,
      isAuthenticated: false,
      hasHydrated: true,
    };

    render(<EditPostPage />);

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('loads post, saves edits, and publishes post', async () => {
    getMock.mockResolvedValue({
      data: {
        post: {
          title: 'Original title',
          context: 'Original description',
          vertex: 'vertex-code',
          fragment: 'fragment-code',
          isPublic: false,
        },
      },
    });

    putMock.mockResolvedValue({});

    render(<EditPostPage />);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/api/posts/{id}', { params: { path: { id: 'p-1' } } });
    });

    expect(screen.getByRole('heading', { name: 'Edit Post' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Shader title…')).toBeInTheDocument();
    expect(screen.getByTestId('ogl-preview')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'set-description' }));
    fireEvent.click(screen.getByRole('button', { name: 'set-vertex.glsl' }));
    fireEvent.click(screen.getByRole('button', { name: 'set-fragment.glsl' }));

    fireEvent.click(screen.getByRole('button', { name: /Save/i }));

    await waitFor(() => {
      expect(putMock).toHaveBeenCalledWith('/api/posts/{id}', {
        params: { path: { id: 'p-1' } },
        body: {
          title: 'Original title',
          context: 'Original description',
          vertex: 'vertex.glsl-updated',
          fragment: 'fragment.glsl-updated',
        },
      });
    });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/my-posts');
    });

    fireEvent.click(screen.getByRole('button', { name: /Publish/i }));

    await waitFor(() => {
      expect(putMock).toHaveBeenCalledWith('/api/posts/posts/{id}/publish', { params: { path: { id: 'p-1' } } });
    });
  });

  it('shows Published state and blocks publish when post is already public', async () => {
    getMock.mockResolvedValue({
      data: {
        post: {
          title: 'Public title',
          context: 'Public description',
          vertex: 'vertex-code',
          fragment: 'fragment-code',
          isPublic: true,
        },
      },
    });

    render(<EditPostPage />);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/api/posts/{id}', { params: { path: { id: 'p-1' } } });
    });

    const publishedButton = screen.getByRole('button', { name: /Published/i });
    fireEvent.click(publishedButton);
    expect(putMock).not.toHaveBeenCalledWith('/api/posts/posts/{id}/publish', expect.anything());
  });

  it('redirects to my-posts when post is missing', async () => {
    getMock.mockResolvedValue({ data: { post: null } });

    render(<EditPostPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/my-posts');
    });
  });
});
