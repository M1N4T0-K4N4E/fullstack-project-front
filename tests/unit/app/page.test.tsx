import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import LandingPage from '@/app/page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: () => ({ isAuthenticated: false, user: null }),
}));

vi.mock('@paper-design/shaders-react', () => ({
  SimplexNoise: () => <div data-testid="simplex-noise" />,
}));

vi.mock('@/components/app/site-header', () => ({
  SiteHeader: () => <div data-testid="site-header" />,
}));

vi.mock('@/components/app/footer', () => ({
  Footer: () => <div data-testid="footer" />,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/app/shader-card', () => ({
  ShaderCard: ({ name, username, like, dislike, url }: { name: string; username: string; like: number; dislike: number; url: string }) => (
    <div data-testid="shader-card" data-url={url}>
      <span>{name}</span>
      <span>{username}</span>
      <span>{like}</span>
      <span>{dislike}</span>
    </div>
  ),
}));

describe('landing page', () => {
  it('renders hero, shader cards, CTA section, and footer', () => {
    render(<LandingPage />);

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByTestId('simplex-noise')).toBeInTheDocument();
    expect(screen.getByText('Welcome to shaderd')).toBeInTheDocument();

    const cards = screen.getAllByTestId('shader-card');
    expect(cards).toHaveLength(4);
    expect(cards[0]).toHaveAttribute('data-url', '/shader/1/hello');

    expect(screen.getByText('Contribute to the library!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload a shader' })).toBeInTheDocument();

    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});
