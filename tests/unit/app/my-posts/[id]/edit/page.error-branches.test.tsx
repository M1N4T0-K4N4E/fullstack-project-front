import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import EditPostPage from '@/app/my-posts/[id]/edit/page';

const pushMock = vi.fn();
const getMock = vi.fn();
let formikState: {
  values: { title: string; content: string; vertex: string; fragment: string };
  errors: { title?: string; vertex?: string; fragment?: string };
  touched: { title?: boolean; vertex?: boolean; fragment?: boolean };
  submitCount: number;
};

let authState: {
  user: { name: string } | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  getAuthClient: () => {
    GET: typeof getMock;
    PUT: () => Promise<unknown>;
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

vi.mock('formik', () => ({
  useFormik: () => ({
    values: formikState.values,
    errors: formikState.errors,
    touched: formikState.touched,
    submitCount: formikState.submitCount,
    handleSubmit: (e?: { preventDefault?: () => void }) => e?.preventDefault?.(),
    handleChange: vi.fn(),
    setFieldValue: vi.fn(),
  }),
}));

vi.mock('@/components/app/site-header', () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}));

vi.mock('@/components/app/footer', () => ({
  Footer: () => <div data-testid="footer" />,
}));

vi.mock('@/components/app/tiptap-editor', () => ({
  TiptapEditor: () => <div>editor</div>,
}));

vi.mock('@/components/app/shader-editor', () => ({
  ShaderEditor: ({ name }: { name: string }) => <div>{name}</div>,
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
  Button: ({ asChild, children, ...props }: { asChild?: boolean; children: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) =>
    asChild ? <>{children}</> : <button {...props}>{children}</button>,
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

describe('edit post page error branches', () => {
  beforeEach(() => {
    pushMock.mockReset();
    getMock.mockReset();

    authState = {
      user: { name: 'Alice' },
      isAuthenticated: true,
      hasHydrated: true,
      getAuthClient: () => ({ GET: getMock, PUT: async () => ({}) }),
    };

    formikState = {
      values: {
        title: '',
        content: 'desc',
        vertex: '',
        fragment: '',
      },
      errors: {
        title: 'Title is required',
        vertex: 'Vertex shader cannot be empty',
        fragment: 'Fragment shader cannot be empty',
      },
      touched: {
        title: true,
        vertex: true,
        fragment: true,
      },
      submitCount: 1,
    };

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
  });

  it('renders title, vertex and fragment validation messages', async () => {
    render(<EditPostPage />);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/api/posts/{id}', { params: { path: { id: 'p-1' } } });
    });

    await screen.findByRole('heading', { name: 'Edit Post' });

    expect(await screen.findByText('Title is required')).toBeInTheDocument();
    expect(await screen.findByText('Vertex shader cannot be empty')).toBeInTheDocument();
    expect(await screen.findByText('Fragment shader cannot be empty')).toBeInTheDocument();
  });

  it('does not render validation messages when fields are untouched and submitCount is zero', async () => {
    formikState.touched = { title: false, vertex: false, fragment: false };
    formikState.submitCount = 0;

    render(<EditPostPage />);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/api/posts/{id}', { params: { path: { id: 'p-1' } } });
    });

    await screen.findByRole('heading', { name: 'Edit Post' });

    expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    expect(screen.queryByText('Vertex shader cannot be empty')).not.toBeInTheDocument();
    expect(screen.queryByText('Fragment shader cannot be empty')).not.toBeInTheDocument();
  });

  it('maps missing API post fields to fallback defaults', async () => {
    getMock.mockResolvedValue({ data: { post: {} } });

    render(<EditPostPage />);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/api/posts/{id}', { params: { path: { id: 'p-1' } } });
    });

    expect(screen.getByRole('heading', { name: 'Edit Post' })).toBeInTheDocument();
  });
});
