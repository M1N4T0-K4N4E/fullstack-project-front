import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ModeratorOverviewPage from '@/app/moderator/page';

const fetchUsersMock = vi.fn();
const fetchPostsMock = vi.fn();

vi.mock('@/store/admin-store', () => ({
  useAdminStore: () => ({
    users: [
      { id: 'u1', role: 'user', status: 'active' },
      { id: 'u2', role: 'user', status: 'timed_out' },
      { id: 'u3', role: 'moderator', status: 'active' },
    ],
    posts: [
      { id: 'p1', removed: false },
      { id: 'p2', removed: true },
      { id: 'p3', removed: false },
    ],
    fetchUsers: fetchUsersMock,
    fetchPosts: fetchPostsMock,
  }),
}));

describe('moderator overview page', () => {
  beforeEach(() => {
    fetchUsersMock.mockReset();
    fetchPostsMock.mockReset();
  });

  it('loads stats and renders user/content summary cards', () => {
    render(<ModeratorOverviewPage />);

    expect(fetchUsersMock).toHaveBeenCalledTimes(1);
    expect(fetchPostsMock).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('heading', { name: 'Overview' })).toBeInTheDocument();
    expect(screen.getByText('Moderation overview at a glance')).toBeInTheDocument();

    expect(screen.getByText('Total users')).toBeInTheDocument();
    expect(screen.getAllByText('2')).toHaveLength(2);

    expect(screen.getByText('Timed out')).toBeInTheDocument();
    expect(screen.getAllByText('1')).toHaveLength(2);

    expect(screen.getByText('Live posts')).toBeInTheDocument();
    expect(screen.getByText('Removed posts')).toBeInTheDocument();
  });
});
