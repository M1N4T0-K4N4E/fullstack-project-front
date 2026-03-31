import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AdminOverviewPage from '@/app/admin/page';

const fetchUsersMock = vi.fn();
const fetchPostsMock = vi.fn();

vi.mock('next/link', () => ({
  default: ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

vi.mock('luxon', () => ({
  DateTime: {
    fromISO: (iso: string) => ({
      toFormat: () => `FMT:${iso}`,
    }),
  },
}));

vi.mock('@/store/admin-store', () => ({
  useAdminStore: () => ({
    users: [
      { id: 'u1', role: 'moderator', status: 'active' },
      { id: 'u2', role: 'user', status: 'banned' },
      { id: 'u3', role: 'user', status: 'timed_out' },
    ],
    posts: [
      { id: 'p1', removed: false },
      { id: 'p2', removed: true },
      { id: 'p3', removed: false },
    ],
    logs: [
      { id: 'l1', username: 'Alice', action: 'did a', target: 'Target A', timestamp: '2026-03-29T10:00:00.000Z' },
      { id: 'l2', username: 'Bob', action: 'did b', target: '', timestamp: '2026-03-31T10:00:00.000Z' },
      { id: 'l3', username: 'Cindy', action: 'did c', target: 'Target C', timestamp: '2026-03-28T10:00:00.000Z' },
      { id: 'l4', username: 'Dan', action: 'did d', target: 'Target D', timestamp: '2026-03-27T10:00:00.000Z' },
      { id: 'l5', username: 'Eve', action: 'did e', target: 'Target E', timestamp: '2026-03-26T10:00:00.000Z' },
      { id: 'l6', username: 'Frank', action: 'did f', target: 'Target F', timestamp: '2026-03-25T10:00:00.000Z' },
      { id: 'l7', username: 'Grace', action: 'did g', target: 'Target G', timestamp: '2026-03-24T10:00:00.000Z' },
    ],
    fetchUsers: fetchUsersMock,
    fetchPosts: fetchPostsMock,
  }),
}));

describe('admin overview page', () => {
  beforeEach(() => {
    fetchUsersMock.mockReset();
    fetchPostsMock.mockReset();
  });

  it('renders stats, recent activity, and calls fetchers', () => {
    render(<AdminOverviewPage />);

    expect(fetchUsersMock).toHaveBeenCalledTimes(1);
    expect(fetchPostsMock).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByText('Platform health at a glance')).toBeInTheDocument();

    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getByText('Moderators')).toBeInTheDocument();
    expect(screen.getByText('Banned')).toBeInTheDocument();
    expect(screen.getByText('Timed out')).toBeInTheDocument();

    expect(screen.getByText('Activity logs')).toBeInTheDocument();
    expect(screen.getByText('Live posts')).toBeInTheDocument();
    expect(screen.getByText('Removed posts')).toBeInTheDocument();

    expect(screen.getByRole('link', { name: 'View all →' })).toHaveAttribute('href', '/admin/activity');

    // Recent logs should be sorted descending and sliced to 6 items.
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.queryByText('Grace')).not.toBeInTheDocument();

    // Covers target present/absent rendering branch.
    expect(screen.getByText('· Target A')).toBeInTheDocument();

    // Date formatting path through luxon mock.
    expect(screen.getByText('FMT:2026-03-31T10:00:00.000Z')).toBeInTheDocument();
  });
});
