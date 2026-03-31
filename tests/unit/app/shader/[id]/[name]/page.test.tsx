import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ShaderDetailPage from '@/app/shader/[id]/[name]/page';

const publicGetMock = vi.fn();
const authGetMock = vi.fn();
const authPutMock = vi.fn();
const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
const highlightMock = vi.fn((code: string) => `hl:${code}`);
const mapProgramUniformMock = vi.fn((v: unknown) => v);

const oglState: {
  time: number;
  program: null | { uniforms: Record<string, { value: unknown }> };
} = {
  time: 0,
  program: null,
};

let paramsState: { id: string; name: string } = { id: 'post-1', name: 'demo' };

let authState: {
  user: { name: string } | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  getAuthClient: () => {
    GET: typeof authGetMock;
    PUT: typeof authPutMock;
  };
};

vi.mock('next/navigation', () => ({
  useParams: () => paramsState,
}));

vi.mock('@/lib/api', () => ({
  client: {
    GET: (...args: unknown[]) => publicGetMock(...args),
  },
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: () => authState,
}));

vi.mock('@/components/app/code-block/shared', () => ({
  highlight: (code: string) => highlightMock(code),
}));

vi.mock('@/components/app/code-block/code-block', () => ({
  CodeBlock: ({ name, initial }: { name: string; initial: string }) => (
    <div data-testid={`code-${name}`}>{initial}</div>
  ),
}));

vi.mock('@/components/app/footer', () => ({
  Footer: () => <div data-testid="footer" />,
}));

vi.mock('@/components/app/markdown-block/markdown-block', () => ({
  MarkdownBlock: ({ content }: { content: string }) => <div data-testid="markdown">{content}</div>,
}));

vi.mock('@/components/app/ogl/ogl', () => ({
  OGL: () => <div data-testid="ogl" />,
}));

vi.mock('@/components/app/ogl/store', () => ({
  OGLProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useOGLContext: (selector: (s: typeof oglState) => unknown) => selector(oglState),
}));

vi.mock('@/components/app/ogl/shader', () => ({
  MAP_PROGRAM_UNIFORM: (v: unknown) => mapProgramUniformMock(v),
  UNIFORMS: () => ['uScale'],
  UNIFORM_DEFAULT: () => ({
    uScale: 1,
    uResolution: [1, 1],
  }),
}));

vi.mock('@/components/app/site-header', () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
    const { disabled: _disabled, ...buttonProps } = props;
    return <button {...buttonProps}>{children}</button>;
  },
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr />,
}));

vi.mock('avvvatars-react', () => ({
  default: () => <div data-testid="avatar-shape" />,
}));

vi.mock('leva', () => ({
  LevaInputs: { STRING: 'string' },
  useControls: (factory: () => Record<string, unknown>) => {
    const generated = factory();
    return [{ ...generated, uScale: 2 }];
  },
  Leva: () => <div data-testid="leva" />,
}));

vi.mock('lucide-react', () => ({
  CopyIcon: () => <span>copy-icon</span>,
  HeartIcon: ({ fill }: { fill?: string }) => <span>{fill === 'red' ? 'heart-red' : 'heart-empty'}</span>,
}));

vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

describe('shader detail page', () => {
  beforeEach(() => {
    paramsState = { id: 'post-1', name: 'demo' };

    publicGetMock.mockReset();
    authGetMock.mockReset();
    authPutMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
    highlightMock.mockClear();
    mapProgramUniformMock.mockClear();

    oglState.time = 0;
    oglState.program = null;

    authState = {
      user: { name: 'Alice' },
      isAuthenticated: true,
      hasHydrated: true,
      getAuthClient: () => ({ GET: authGetMock, PUT: authPutMock }),
    };

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(),
      },
    });
  });

  it('loads data with auth client, renders details, likes and copies link', async () => {
    authGetMock.mockResolvedValue({
      data: {
        post: {
          id: 'post-1',
          title: 'Shader One',
          context: 'Some markdown',
          vertex: 'vertex-code',
          fragment: 'fragment-code',
          user: { name: '@alice' },
          like: 1,
          dislike: 0,
          isUserLiked: false,
          thumbnail: '/thumb.png',
        },
      },
    });
    authPutMock.mockResolvedValue({});

    render(<ShaderDetailPage />);

    await waitFor(() => {
      expect(authGetMock).toHaveBeenCalledWith('/api/posts/{id}', { params: { path: { id: 'post-1' } } });
    });

    expect(screen.getByText('Shader One')).toBeInTheDocument();
    expect(screen.getByTestId('markdown')).toHaveTextContent('Some markdown');
    expect(screen.getByTestId('code-vertex.glsl')).toHaveTextContent('hl:vertex-code');
    expect(screen.getByTestId('code-fragment.glsl')).toHaveTextContent('hl:fragment-code');

    fireEvent.click(screen.getByRole('button', { name: /Copy Link/i }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    expect(toastSuccessMock).toHaveBeenCalledWith('Link copied!');

    fireEvent.click(screen.getByRole('button', { name: /\+1/i }));
    await waitFor(() => {
      expect(authPutMock).toHaveBeenCalledWith('/api/posts/like/{id}', { params: { path: { id: 'post-1' } } });
      expect(screen.getByText('+2')).toBeInTheDocument();
      expect(screen.getByText('heart-red')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /\+2/i }));
    await waitFor(() => {
      expect(authPutMock).toHaveBeenCalledTimes(2);
      expect(screen.getByText('+1')).toBeInTheDocument();
      expect(screen.getByText('heart-empty')).toBeInTheDocument();
    });
  });

  it('uses public client when unauthenticated and shows sign-in toast on like', async () => {
    authState = {
      ...authState,
      user: null,
      isAuthenticated: false,
      hasHydrated: true,
    };

    publicGetMock.mockResolvedValue({
      data: {
        post: {
          title: 'Public Shader',
          context: 'public',
          vertex: 'v',
          fragment: 'f',
          user: { name: 'guest' },
          like: 5,
          isUserLiked: false,
        },
      },
    });

    render(<ShaderDetailPage />);

    await waitFor(() => {
      expect(publicGetMock).toHaveBeenCalledWith('/api/posts/{id}', { params: { path: { id: 'post-1' } } });
      expect(authGetMock).not.toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: /\+5/i }));
    expect(toastErrorMock).toHaveBeenCalledWith('Sign in to like shaders');
  });

  it('maps fallback values when post fields are missing and hides markdown without context', async () => {
    authGetMock.mockResolvedValue({
      data: {
        post: {
          id: undefined,
          title: undefined,
          context: undefined,
          vertex: undefined,
          fragment: undefined,
          user: undefined,
          like: undefined,
          dislike: undefined,
          isUserLiked: undefined,
          thumbnail: undefined,
        },
      },
    });

    render(<ShaderDetailPage />);

    await waitFor(() => {
      expect(authGetMock).toHaveBeenCalledWith('/api/posts/{id}', { params: { path: { id: 'post-1' } } });
    });

    expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
    expect(screen.getByTestId('code-vertex.glsl')).toHaveTextContent('hl:attribute vec2 uv');
    expect(screen.getByTestId('code-fragment.glsl')).toHaveTextContent('hl:precision highp float');
    expect(screen.getByRole('button', { name: /\+0/i })).toBeInTheDocument();
  });

  it('updates program uniforms through shader preview effect and skips time/resolution uniforms', async () => {
    oglState.program = { uniforms: { uScale: { value: 0 }, uResolution: { value: [0, 0] } } };

    authGetMock.mockResolvedValue({
      data: {
        post: {
          title: 'Shader Uniform',
          context: 'ctx',
          vertex: 'v',
          fragment: 'f',
          user: { name: 'bob' },
          like: 0,
          isUserLiked: false,
        },
      },
    });

    render(<ShaderDetailPage />);

    await waitFor(() => {
      expect(authGetMock).toHaveBeenCalled();
      expect(mapProgramUniformMock).toHaveBeenCalledWith(2);
    });

    expect(oglState.program.uniforms.uScale.value).toBe(2);
  });

  it('does nothing when API response has no post object', async () => {
    authGetMock.mockResolvedValue({ data: { post: null } });

    render(<ShaderDetailPage />);

    await waitFor(() => {
      expect(authGetMock).toHaveBeenCalled();
    });

    expect(screen.getAllByText('…').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('markdown')).not.toBeInTheDocument();
  });

  it('skips fetch when route id is empty', () => {
    paramsState = { id: '', name: 'demo' };

    render(<ShaderDetailPage />);

    expect(publicGetMock).not.toHaveBeenCalled();
    expect(authGetMock).not.toHaveBeenCalled();
  });
});
