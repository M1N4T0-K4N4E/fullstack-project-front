import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

const getMock = vi.fn();

vi.mock('@/lib/api', () => ({
  client: {
    GET: (...args: unknown[]) => getMock(...args),
  },
}));

vi.mock('@/components/app/site-header', () => ({
  SiteHeader: () => <header data-testid="site-header">Header</header>,
}));

vi.mock('@/components/app/footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) => (
    <div>
      <select aria-label="sort" value={value} onChange={(e) => onValueChange(e.target.value)}>
        <option value="title">title</option>
        <option value="newest">newest</option>
      </select>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  SearchIcon: () => <svg data-testid="search-icon" />,
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import DiscoverPage from '@/app/shader/page';

describe('discover shader page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loaded posts and supports filtering/sorting interactions', async () => {
    getMock.mockResolvedValue({
      data: {
        data: [
          {
            id: 'p-2',
            title: 'Beta Wave',
            user: { name: 'Nora' },
            thumbnail: null,
            like: 2,
            dislike: 0,
          },
          {
            id: 'p-1',
            title: 'Alpha Glow',
            user: { name: 'Alex' },
            thumbnail: '/thumb.png',
            like: 5,
            dislike: 1,
          },
          {
            id: undefined,
            title: undefined,
            user: null,
            thumbnail: undefined,
            like: undefined,
            dislike: undefined,
          },
        ],
      },
    });

    render(<DiscoverPage />);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/api/posts');
    });

    expect(screen.getByTestId('site-header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Discover')).toBeInTheDocument();
    expect(screen.getByText('3 shader(s)')).toBeInTheDocument();
    expect(screen.getByText('Alpha Glow')).toBeInTheDocument();
    expect(screen.getByText('Beta Wave')).toBeInTheDocument();
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('Nora')).toBeInTheDocument();
    expect(screen.getByText('♥ 5')).toBeInTheDocument();
    expect(screen.getByText('♥ 2')).toBeInTheDocument();

    const links = screen.getAllByRole('link');
    expect(links.some((l) => l.getAttribute('href') === '/shader/p-1/alpha-glow')).toBe(true);
    expect(links.some((l) => l.getAttribute('href') === '/shader/p-2/beta-wave')).toBe(true);

    const images = screen.getAllByRole('presentation');
    expect(images.some((img) => img.getAttribute('src') === '/thumb.png')).toBe(true);
    expect(images.some((img) => img.getAttribute('src') === '/transition_02-ezgif.com-optimize-1.gif')).toBe(true);

    fireEvent.change(screen.getByLabelText('sort'), { target: { value: 'newest' } });
    expect(screen.getByText('Alpha Glow')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search by title or author…'), { target: { value: 'Alex' } });
    expect(screen.getByText('1 shader(s)')).toBeInTheDocument();
    expect(screen.getByText('Alpha Glow')).toBeInTheDocument();
    expect(screen.queryByText('Beta Wave')).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search by title or author…'), { target: { value: 'missing' } });
    expect(screen.getByText('No shaders found')).toBeInTheDocument();
    expect(screen.getByText('Try a different search term.')).toBeInTheDocument();
  });

  it('shows empty-state copy when no posts are returned', async () => {
    getMock.mockResolvedValue({ data: null });

    render(<DiscoverPage />);

    await waitFor(() => {
      expect(getMock).toHaveBeenCalledWith('/api/posts');
    });

    expect(screen.getByText('No shaders found')).toBeInTheDocument();
    expect(screen.getByText('No shaders have been published yet.')).toBeInTheDocument();
  });
});
