import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ModeratorUsersPage from '@/app/moderator/users/page';

type ManagedUserLike = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'banned' | 'timed_out';
  timeoutUntil?: string;
  createdAt: string;
};

const fetchUsersMock = vi.fn().mockResolvedValue(undefined);
const timeoutUserMock = vi.fn().mockResolvedValue(undefined);

let storeState: {
  users: ManagedUserLike[];
  fetchUsers: typeof fetchUsersMock;
  timeoutUser: typeof timeoutUserMock;
};

vi.mock('@/store/admin-store', () => ({
  useAdminStore: (selector?: (state: typeof storeState) => unknown) => {
    if (typeof selector === 'function') return selector(storeState);
    return storeState;
  },
}));

vi.mock('avvvatars-react', () => ({
  default: () => <div data-testid="avvvatars" />,
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

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => <span {...props}>{children}</span>,
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, onOpenChange, children }: { open: boolean; onOpenChange?: (v: boolean) => void; children: React.ReactNode }) => (
    open ? (
      <div>
        <button type="button" onClick={() => onOpenChange?.(true)}>dialog-open-true</button>
        <button type="button" onClick={() => onOpenChange?.(false)}>dialog-close-false</button>
        {children}
      </div>
    ) : null
  ),
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) => (
    <div>
      <button type="button" onClick={() => onValueChange('15')}>set-duration-15</button>
      <span data-testid="select-value">{value}</span>
      {children}
    </div>
  ),
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

describe('moderator users page', () => {
  beforeEach(() => {
    fetchUsersMock.mockReset();
    timeoutUserMock.mockReset();

    storeState = {
      users: [
        {
          id: 'u-admin',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          createdAt: '2026-03-01T10:00:00.000Z',
        },
        {
          id: 'u-user',
          name: 'Normal User',
          email: 'user@example.com',
          role: 'user',
          status: 'active',
          createdAt: '2026-03-02T10:00:00.000Z',
        },
        {
          id: 'u-timed',
          name: 'Timed User',
          email: 'timed@example.com',
          role: 'user',
          status: 'timed_out',
          timeoutUntil: '2026-04-01T11:00:00.000Z',
          createdAt: '2026-03-03T10:00:00.000Z',
        },
        {
          id: 'u-timed-no-until',
          name: 'Timed No Until',
          email: 'timed2@example.com',
          role: 'user',
          status: 'timed_out',
          createdAt: '2026-03-03T12:00:00.000Z',
        },
        {
          id: 'u-banned',
          name: 'Banned User',
          email: 'banned@example.com',
          role: 'user',
          status: 'banned',
          createdAt: '2026-03-04T10:00:00.000Z',
        },
        ...Array.from({ length: 8 }).map((_, i) => ({
          id: `u-extra-${i + 1}`,
          name: `Extra ${i + 1}`,
          email: `extra${i + 1}@example.com`,
          role: 'user' as const,
          status: 'active' as const,
          createdAt: '2026-03-05T10:00:00.000Z',
        })),
      ],
      fetchUsers: fetchUsersMock,
      timeoutUser: timeoutUserMock,
    };
  });

  it('renders users table and handles timeout moderation flows', async () => {
    render(<ModeratorUsersPage />);

    await waitFor(() => {
      expect(fetchUsersMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByText('Timeout users who violate community guidelines')).toBeInTheDocument();

    expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    expect(screen.getByText('Normal User')).toBeInTheDocument();
    expect(screen.getByText('Timed User')).toBeInTheDocument();
    expect(screen.getByText('Banned User')).toBeInTheDocument();

    expect(screen.getAllByText('active').length).toBeGreaterThan(0);
    expect(screen.getAllByText('timed out').length).toBeGreaterThan(0);
    expect(screen.getByText('banned')).toBeInTheDocument();
    expect(screen.getByText('until FMT:2026-04-01T11:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText('FMT:2026-03-02T10:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText('Banned')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Timeout/i })[0]);
    expect(screen.getByRole('heading', { name: 'Timeout Normal User' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'set-duration-15' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply timeout' }));

    await waitFor(() => {
      expect(timeoutUserMock).toHaveBeenCalledWith('u-user', 15);
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Timeout/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('heading', { name: 'Timeout Normal User' })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Timeout/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'dialog-open-true' }));
    expect(screen.getByRole('heading', { name: 'Timeout Normal User' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'dialog-close-false' }));
    expect(screen.queryByRole('heading', { name: 'Timeout Normal User' })).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'User' }));
      fireEvent.click(screen.getByRole('button', { name: 'Joined' }));
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
      fireEvent.change(screen.getByPlaceholderText('Filter by name…'), { target: { value: 'Timed User' } });
    });

    expect(screen.getByDisplayValue('Timed User')).toBeInTheDocument();
    expect(screen.getByText('1 user(s)')).toBeInTheDocument();
  }, { timeout: 30000 });

  it('shows empty state and disables pagination when there are no managed users', async () => {
    storeState = {
      ...storeState,
      users: [],
    };

    render(<ModeratorUsersPage />);

    await waitFor(() => {
      expect(fetchUsersMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('No results.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
