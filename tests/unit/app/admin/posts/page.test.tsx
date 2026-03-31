import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminPostsPage from '@/app/admin/posts/page';

const fetchPostsMock = vi.fn();
const removePostMock = vi.fn();
const restorePostMock = vi.fn();

type PostRecord = {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
  removed: boolean;
};

let postsState: PostRecord[] = [];

vi.mock('@/store/admin-store', () => ({
  useAdminStore: () => ({
    posts: postsState,
    removePost: removePostMock,
    restorePost: restorePostMock,
    fetchPosts: fetchPostsMock,
  }),
}));

vi.mock('luxon', () => ({
  DateTime: {
    fromISO: (iso: string) => ({
      toFormat: () => `FMT:${iso}`,
    }),
  },
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

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props}>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableCell: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <td {...props}>{children}</td>,
}));

describe('admin posts page', () => {
  beforeEach(() => {
    fetchPostsMock.mockReset();
    removePostMock.mockReset();
    restorePostMock.mockReset();

    postsState = [
      {
        id: 'p1',
        title: 'Live post',
        authorName: 'alice',
        createdAt: '2026-03-31T10:00:00.000Z',
        removed: false,
      },
      {
        id: 'p2',
        title: 'Removed post',
        authorName: 'bob',
        createdAt: '2026-03-30T10:00:00.000Z',
        removed: true,
      },
      ...Array.from({ length: 10 }).map((_, i) => ({
        id: `p-extra-${i + 1}`,
        title: `Extra post ${i + 1}`,
        authorName: `author-${i + 1}`,
        createdAt: '2026-03-01T10:00:00.000Z',
        removed: false,
      })),
    ];
  });

  it('renders posts table and triggers moderation actions', async () => {
    render(<AdminPostsPage />);

    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole('heading', { name: 'Posts' })).toBeInTheDocument();
    expect(screen.getByText('Review and moderate user-submitted content')).toBeInTheDocument();

    expect(screen.getByText('Live post')).toBeInTheDocument();
    expect(screen.getByText('Removed post')).toBeInTheDocument();
    expect(screen.getByText('FMT:2026-03-31T10:00:00.000Z')).toBeInTheDocument();
    expect(screen.getAllByText('Live').length).toBeGreaterThan(0);
    expect(screen.getByText('Removed')).toBeInTheDocument();

    const liveRow = screen.getByText('Live post').closest('tr');
    const removedRow = screen.getByText('Removed post').closest('tr');
    expect(liveRow).toBeTruthy();
    expect(removedRow).toBeTruthy();

    fireEvent.click(liveRow!.querySelector('button') as HTMLButtonElement);
    fireEvent.click(removedRow!.querySelector('button') as HTMLButtonElement);

    expect(removePostMock).toHaveBeenCalledWith('p1');
    expect(restorePostMock).toHaveBeenCalledWith('p2');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Title/i }));
      fireEvent.click(screen.getByRole('button', { name: /Posted/i }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Previous' })).not.toBeDisabled();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    });

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Filter by title…'), { target: { value: 'Live' } });
    });
    expect(screen.getByDisplayValue('Live')).toBeInTheDocument();

    expect(screen.getByText('1 post(s)')).toBeInTheDocument();
  });

  it('shows empty state and disabled pagination at bounds', async () => {
    postsState = [];

    render(<AdminPostsPage />);

    await waitFor(() => {
      expect(fetchPostsMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('No results.')).toBeInTheDocument();

    const previousButton = screen.getByRole('button', { name: 'Previous' });
    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
});
