import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminPostsPage from '@/app/admin/posts/page';

vi.mock('@/store/admin-store', () => ({
  useAdminStore: () => ({
    posts: [],
    removePost: vi.fn(),
    restorePost: vi.fn(),
    fetchPosts: vi.fn(),
  }),
}));

vi.mock('@tanstack/react-table', () => ({
  flexRender: (value: unknown, ctx: unknown) => (typeof value === 'function' ? (value as (context: unknown) => unknown)(ctx) : value),
  getCoreRowModel: () => () => ({}),
  getFilteredRowModel: () => () => ({}),
  getPaginationRowModel: () => () => ({}),
  getSortedRowModel: () => () => ({}),
  useReactTable: () => ({
    getColumn: () => ({
      getFilterValue: () => '',
      setFilterValue: vi.fn(),
    }),
    getHeaderGroups: () => [
      {
        id: 'hg-1',
        headers: [
          {
            id: 'placeholder-header',
            isPlaceholder: true,
            column: { columnDef: { header: 'Title' } },
            getContext: () => ({}),
          },
        ],
      },
    ],
    getRowModel: () => ({ rows: [] }),
    getFilteredRowModel: () => ({ rows: [] }),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    getCanPreviousPage: () => false,
    getCanNextPage: () => false,
  }),
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

vi.mock('luxon', () => ({
  DateTime: {
    fromISO: () => ({
      toFormat: () => 'mock-date',
    }),
  },
}));

describe('admin posts page placeholder headers', () => {
  it('handles placeholder headers without rendering content', () => {
    render(<AdminPostsPage />);

    expect(screen.queryByText('Title')).not.toBeInTheDocument();
    expect(screen.getByText('No results.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
