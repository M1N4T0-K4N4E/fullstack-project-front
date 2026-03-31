import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminActivityPage from '@/app/admin/activity/page';

const storeState = {
  logs: [],
  logsPage: 1,
  logsTotal: 0,
  logsTotalPages: 1,
  logsLimit: 20,
  isLoadingLogs: false,
  fetchLogs: vi.fn(),
};

vi.mock('@/store/admin-store', () => ({
  useAdminStore: (selector: (state: typeof storeState) => unknown) => selector(storeState),
}));

vi.mock('@tanstack/react-table', () => ({
  flexRender: (value: unknown, ctx: unknown) => (typeof value === 'function' ? (value as (context: unknown) => unknown)(ctx) : value),
  getCoreRowModel: () => () => ({}),
  getFilteredRowModel: () => () => ({}),
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
  }),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props}>{children}</button>,
}));

vi.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => <input {...props} />,
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

describe('admin activity page placeholder headers', () => {
  it('handles placeholder headers without rendering header content', () => {
    render(<AdminActivityPage />);

    expect(screen.queryByText('User')).not.toBeInTheDocument();
    expect(screen.getByText('No results.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
