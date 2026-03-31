import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminUsersPage from '@/app/admin/users/page';

type ManagedUserLike = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'banned' | 'timed_out';
  timeoutUntil: string | null;
  createdAt: string;
};

const fetchUsersMock = vi.fn().mockResolvedValue(undefined);
const banUserMock = vi.fn().mockResolvedValue(undefined);
const unbanUserMock = vi.fn().mockResolvedValue(undefined);
const promoteToModeratorMock = vi.fn().mockResolvedValue(undefined);
const demoteModeratorMock = vi.fn().mockResolvedValue(undefined);
const timeoutUserMock = vi.fn().mockResolvedValue(undefined);

let storeState: {
  users: ManagedUserLike[];
  fetchUsers: typeof fetchUsersMock;
  banUser: typeof banUserMock;
  unbanUser: typeof unbanUserMock;
  promoteToModerator: typeof promoteToModeratorMock;
  demoteModerator: typeof demoteModeratorMock;
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

vi.mock('lucide-react', () => ({
  ArrowUpDown: () => <svg data-testid="arrow-up-down" />,
  MoreHorizontalIcon: () => <svg data-testid="more" />,
  ShieldIcon: () => <svg data-testid="shield" />,
  ShieldOffIcon: () => <svg data-testid="shield-off" />,
  TimerIcon: () => <svg data-testid="timer" />,
  BanIcon: () => <svg data-testid="ban" />,
  RotateCcwIcon: () => <svg data-testid="undo" />,
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
        <button type="button" onClick={() => onOpenChange?.(false)}>dialog-close</button>
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

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children, onClick, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button type="button" onClick={onClick} {...props}>{children}</button>
  ),
  DropdownMenuSeparator: () => <hr />,
}));

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props}>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableCell: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <td {...props}>{children}</td>,
}));

describe('admin users page', () => {
  beforeEach(() => {
    fetchUsersMock.mockReset();
    banUserMock.mockReset();
    unbanUserMock.mockReset();
    promoteToModeratorMock.mockReset();
    demoteModeratorMock.mockReset();
    timeoutUserMock.mockReset();

    storeState = {
      users: [
        {
          id: 'u-admin',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin',
          status: 'active',
          timeoutUntil: null,
          createdAt: '2026-03-01T10:00:00.000Z',
        },
        {
          id: 'u-user',
          name: 'Normal User',
          email: 'user@example.com',
          role: 'user',
          status: 'active',
          timeoutUntil: null,
          createdAt: '2026-03-02T10:00:00.000Z',
        },
        {
          id: 'u-mod',
          name: 'Mod User',
          email: 'mod@example.com',
          role: 'moderator',
          status: 'timed_out',
          timeoutUntil: '2026-04-01T11:00:00.000Z',
          createdAt: '2026-03-03T10:00:00.000Z',
        },
        {
          id: 'u-banned',
          name: 'Banned User',
          email: 'banned@example.com',
          role: 'user',
          status: 'banned',
          timeoutUntil: null,
          createdAt: '2026-03-04T10:00:00.000Z',
        },
        ...Array.from({ length: 8 }).map((_, i) => ({
          id: `u-extra-${i + 1}`,
          name: `Extra ${i + 1}`,
          email: `extra${i + 1}@example.com`,
          role: 'user' as const,
          status: 'active' as const,
          timeoutUntil: null,
          createdAt: '2026-03-05T10:00:00.000Z',
        })),
      ],
      fetchUsers: fetchUsersMock,
      banUser: banUserMock,
      unbanUser: unbanUserMock,
      promoteToModerator: promoteToModeratorMock,
      demoteModerator: demoteModeratorMock,
      timeoutUser: timeoutUserMock,
    };
  });

  it('renders users table and triggers role/status moderation actions', async () => {
    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(fetchUsersMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByText('Manage accounts, roles, and access')).toBeInTheDocument();

    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('Normal User')).toBeInTheDocument();
    expect(screen.getByText('Mod User')).toBeInTheDocument();
    expect(screen.getByText('Banned User')).toBeInTheDocument();

    expect(screen.getAllByText('active').length).toBeGreaterThan(0);
    expect(screen.getByText('timed out')).toBeInTheDocument();
    expect(screen.getByText('banned')).toBeInTheDocument();
    expect(screen.getByText('until FMT:2026-04-01T11:00:00.000Z')).toBeInTheDocument();
    expect(screen.getByText('FMT:2026-03-01T10:00:00.000Z')).toBeInTheDocument();

    expect(screen.getAllByRole('button', { name: /Make moderator/i }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole('button', { name: /Make moderator/i })[0]);
    expect(promoteToModeratorMock).toHaveBeenCalledWith('u-user');

    fireEvent.click(screen.getByRole('button', { name: /Remove moderator/i }));
    expect(demoteModeratorMock).toHaveBeenCalledWith('u-mod');

    fireEvent.click(screen.getAllByRole('button', { name: /Ban user/i })[0]);
    expect(banUserMock).toHaveBeenCalledWith('u-user');

    fireEvent.click(screen.getByRole('button', { name: /Unban/i }));
    expect(unbanUserMock).toHaveBeenCalledWith('u-banned');

    fireEvent.click(screen.getAllByRole('button', { name: /Timeout/i })[0]);
    expect(screen.getByRole('heading', { name: 'Timeout Normal User' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'set-duration-15' }));
    fireEvent.click(screen.getByRole('button', { name: 'Apply timeout' }));

    await waitFor(() => {
      expect(timeoutUserMock).toHaveBeenCalledWith('u-user', 15);
    });
    expect(fetchUsersMock).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getAllByRole('button', { name: /Timeout/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('heading', { name: 'Timeout Normal User' })).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: /Timeout/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: 'dialog-close' }));
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
      fireEvent.change(screen.getByPlaceholderText('Filter by name…'), { target: { value: 'Mod' } });
    });

    expect(screen.getByDisplayValue('Mod')).toBeInTheDocument();
    expect(screen.getByText('1 user(s)')).toBeInTheDocument();
  }, { timeout: 10000 });

  it('shows empty state and disables pagination buttons when no users', async () => {
    storeState = {
      ...storeState,
      users: [],
    };

    render(<AdminUsersPage />);

    await waitFor(() => {
      expect(fetchUsersMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText('No results.')).toBeInTheDocument();

    const previous = screen.getByRole('button', { name: 'Previous' });
    const next = screen.getByRole('button', { name: 'Next' });
    expect(previous).toBeDisabled();
    expect(next).toBeDisabled();
  }, { timeout: 10000 });
});
