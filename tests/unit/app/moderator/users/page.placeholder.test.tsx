import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ModeratorUsersPage from '@/app/moderator/users/page';

vi.mock('@/store/admin-store', () => ({
  useAdminStore: (selector?: (state: { users: unknown[]; fetchUsers: () => void; timeoutUser: () => void }) => unknown) => {
    const state = {
      users: [],
      fetchUsers: vi.fn(),
      timeoutUser: vi.fn(),
    };
    if (typeof selector === 'function') return selector(state);
    return state;
  },
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
            column: { columnDef: { header: 'User' } },
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

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => <span>value</span>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props}>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableCell: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <td {...props}>{children}</td>,
}));

vi.mock('avvvatars-react', () => ({
  default: () => <div data-testid="avvvatars" />,
}));

vi.mock('luxon', () => ({
  DateTime: {
    fromISO: () => ({
      toFormat: () => 'mock-date',
    }),
  },
}));

describe('moderator users page placeholder headers', () => {
  it('handles placeholder headers without rendering header content', () => {
    render(<ModeratorUsersPage />);

    expect(screen.queryByText('User')).not.toBeInTheDocument();
    expect(screen.getByText('No results.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
