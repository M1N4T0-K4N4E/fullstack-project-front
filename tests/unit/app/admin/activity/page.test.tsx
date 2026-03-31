import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminActivityPage from '@/app/admin/activity/page';

type Log = {
  id: string;
  username: string;
  action: string;
  target: string;
  timestamp: string;
};

const fetchLogsMock = vi.fn();

let storeState: {
  logs: Log[];
  logsPage: number;
  logsTotal: number;
  logsTotalPages: number;
  logsLimit: number;
  isLoadingLogs: boolean;
  fetchLogs: typeof fetchLogsMock;
};

vi.mock('@/store/admin-store', () => ({
  useAdminStore: (selector: (state: typeof storeState) => unknown) => selector(storeState),
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

vi.mock('@/components/ui/table', () => ({
  Table: ({ children }: { children: React.ReactNode }) => <table>{children}</table>,
  TableHeader: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TableBody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
  TableRow: ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props}>{children}</tr>,
  TableHead: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  TableCell: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => <td {...props}>{children}</td>,
}));

describe('admin activity page', () => {
  beforeEach(() => {
    fetchLogsMock.mockReset();
    storeState = {
      logs: [
        {
          id: 'l1',
          username: 'alice@example.com',
          action: 'login',
          target: '',
          timestamp: '2026-03-31T10:00:00.000Z',
        },
        {
          id: 'l2',
          username: 'bob@example.com',
          action: 'delete',
          target: 'POST /api/posts [200]',
          timestamp: '2026-03-30T10:00:00.000Z',
        },
      ],
      logsPage: 2,
      logsTotal: 12,
      logsTotalPages: 3,
      logsLimit: 20,
      isLoadingLogs: false,
      fetchLogs: fetchLogsMock,
    };
  });

  it('renders table rows, supports paging, and mounts with initial fetch', async () => {
    render(<AdminActivityPage />);

    await waitFor(() => {
      expect(fetchLogsMock).toHaveBeenCalledWith(1, 20);
    });

    expect(screen.getByRole('heading', { name: 'Activity' })).toBeInTheDocument();
    expect(screen.getByText('Full log of user actions on the platform')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Filter by user…')).toBeInTheDocument();

    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
    expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    expect(screen.getByText('POST /api/posts [200]')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    expect(screen.getByText('FMT:2026-03-31T10:00:00.000Z')).toBeInTheDocument();

    expect(screen.getByText('12 log(s) • Page 2 / 3')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /User/i }));
      fireEvent.click(screen.getByRole('button', { name: /Time/i }));
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    });

    expect(fetchLogsMock).toHaveBeenCalledWith(1, 20);
    expect(fetchLogsMock).toHaveBeenCalledWith(3, 20);


    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Filter by user…'), { target: { value: 'alice' } });
    });
    expect(screen.getByDisplayValue('alice')).toBeInTheDocument();
  });

  it('shows empty state and disables paging buttons at bounds/loading', async () => {
    storeState = {
      logs: [],
      logsPage: 1,
      logsTotal: 0,
      logsTotalPages: 1,
      logsLimit: 20,
      isLoadingLogs: true,
      fetchLogs: fetchLogsMock,
    };

    render(<AdminActivityPage />);

    await waitFor(() => {
      expect(fetchLogsMock).toHaveBeenCalledWith(1, 20);
    });

    expect(screen.getByText('No results.')).toBeInTheDocument();

    const previousButton = screen.getByRole('button', { name: 'Previous' });
    const nextButton = screen.getByRole('button', { name: 'Next' });
    expect(previousButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });
});
