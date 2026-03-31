import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as React from 'react';
import EditPostPage from '@/app/my-posts/[id]/edit/page';

const pushMock = vi.fn();
const getMock = vi.fn();
const putMock = vi.fn();
const setPostMock = vi.fn();
const setIsPublishingMock = vi.fn();

const basePost = {
  title: 'Original title',
  content: 'Original description',
  vertex: 'vertex-code',
  fragment: 'fragment-code',
  isPublic: false,
};

let authState: {
  user: { name: string } | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  getAuthClient: () => {
    GET: typeof getMock;
    PUT: typeof putMock;
  };
};

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return {
    ...actual,
    useState: vi.fn(actual.useState),
  };
});

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
    values: basePost,
    errors: {},
    touched: {},
    submitCount: 0,
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

describe('edit post publish prev-null branch', () => {
  beforeEach(() => {
    pushMock.mockReset();
    getMock.mockReset();
    putMock.mockReset();
    setPostMock.mockReset();
    setIsPublishingMock.mockReset();

    authState = {
      user: { name: 'Alice' },
      isAuthenticated: true,
      hasHydrated: true,
      getAuthClient: () => ({ GET: getMock, PUT: putMock }),
    };

    getMock.mockResolvedValue({ data: { post: null } });
    putMock.mockResolvedValue({});

    const useStateMock = React.useState as unknown as ReturnType<typeof vi.fn>;
    useStateMock.mockReset();
    useStateMock
      .mockImplementationOnce(() => [basePost, setPostMock])
      .mockImplementationOnce(() => [false, setIsPublishingMock]);

    // Force updater branch execution with prev === null when setPost is called.
    setPostMock.mockImplementation((updater: unknown) => {
      if (typeof updater === 'function') {
        (updater as (prev: unknown) => unknown)(null);
      }
    });
  });

  it('executes publish updater fallback branch when previous post is null', async () => {
    render(<EditPostPage />);

    fireEvent.click(screen.getByRole('button', { name: /Publish/i }));

    await waitFor(() => {
      expect(putMock).toHaveBeenCalledWith('/api/posts/posts/{id}/publish', { params: { path: { id: 'p-1' } } });
      expect(setPostMock).toHaveBeenCalled();
      expect(setIsPublishingMock).toHaveBeenCalled();
    });
  });
});
