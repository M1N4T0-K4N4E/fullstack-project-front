import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAuthState: vi.fn(),
}));

vi.mock('@/store/auth-store', () => ({
  useAuthStore: {
    getState: (...args: any[]) => mocks.getAuthState(...args),
  },
}));

import { useAdminStore } from '@/store/admin-store';

function resetAdminStore() {
  const initial = useAdminStore.getInitialState();
  useAdminStore.setState(initial, true);
}

function makeClient() {
  return {
    GET: vi.fn(),
    POST: vi.fn(),
    PUT: vi.fn(),
    PATCH: vi.fn(),
    DELETE: vi.fn(),
  };
}

describe('useAdminStore', () => {
  beforeEach(() => {
    resetAdminStore();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-31T00:00:00.000Z'));
    mocks.getAuthState.mockReset();
  });

  it('returns early for all guarded actions when auth client is unavailable', async () => {
    mocks.getAuthState.mockImplementation(() => ({
      getAuthClient: () => {
        throw new Error('not authenticated');
      },
    }));

    const prev = useAdminStore.getState();

    await useAdminStore.getState().fetchUsers();
    await useAdminStore.getState().fetchLogs();
    await useAdminStore.getState().fetchPosts();
    await useAdminStore.getState().banUser('u1');
    await useAdminStore.getState().timeoutUser('u1', 60);
    await useAdminStore.getState().promoteToModerator('u1');
    await useAdminStore.getState().demoteModerator('u1');
    await useAdminStore.getState().removePost('p1');
    await useAdminStore.getState().restorePost('p1');
    expect(await useAdminStore.getState().createPost('title', 'a1', 'name')).toBeNull();
    await useAdminStore.getState().editPost('p1', { title: 'new' });
    await useAdminStore.getState().deletePost('p1');

    const next = useAdminStore.getState();
    expect(next.users).toEqual(prev.users);
    expect(next.posts).toEqual(prev.posts);
    expect(next.logs).toEqual(prev.logs);
  });

  it('fetches and maps users, logs, and posts', async () => {
    const c = makeClient();
    mocks.getAuthState.mockReturnValue({ getAuthClient: () => c });

    c.GET.mockImplementation(async (path: string) => {
      if (path === '/api/users') {
        return {
          data: {
            data: [
              {
                id: 'u1',
                email: 'one@example.com',
                name: 'One',
                role: 'user',
                createdAt: '2026-03-01T00:00:00.000Z',
                status: 'active',
                timeoutEnd: null,
              },
              {},
            ],
          },
        };
      }

      if (path === '/api/logs/user') {
        return {
          data: {
            data: [
              {
                id: 'log-1',
                userId: 'u1',
                userEmail: 'one@example.com',
                action: 'GET',
                method: 'GET',
                path: '/api/users',
                status: 200,
                createdAt: '2026-03-30T00:00:00.000Z',
              },
              {
                userId: null,
                userEmail: null,
                action: null,
                method: null,
                path: null,
                status: null,
                createdAt: null,
              },
            ],
            page: 2,
            limit: 5,
            total: 11,
            totalPages: 3,
          },
        };
      }

      if (path === '/api/posts') {
        return {
          data: {
            data: [
              {
                id: 'p1',
                title: 'Post 1',
                context: 'Body',
                user: { name: 'Author' },
                createdAt: '2026-03-29T00:00:00.000Z',
                isDeleted: false,
                thumbnail: null,
                like: 5,
                dislike: 1,
              },
            ],
          },
        };
      }

      return { data: {} };
    });

    await useAdminStore.getState().fetchUsers();
    expect(useAdminStore.getState().isLoadingUsers).toBe(false);
    expect(useAdminStore.getState().users).toHaveLength(2);
    expect(useAdminStore.getState().users[1]).toMatchObject({
      id: '',
      email: '',
      name: '',
      role: 'user',
      status: 'active',
    });

    await useAdminStore.getState().fetchLogs(2, 5);
    expect(useAdminStore.getState().isLoadingLogs).toBe(false);
    expect(useAdminStore.getState().logsPage).toBe(2);
    expect(useAdminStore.getState().logsLimit).toBe(5);
    expect(useAdminStore.getState().logsTotal).toBe(11);
    expect(useAdminStore.getState().logsTotalPages).toBe(3);
    expect(useAdminStore.getState().logs[0].target).toBe('GET /api/users [200]');
    expect(useAdminStore.getState().logs[1].target).toBe('—');

    c.GET.mockResolvedValueOnce({ data: undefined });
    await useAdminStore.getState().fetchLogs(9, 7);
    expect(useAdminStore.getState().logs).toEqual([]);
    expect(useAdminStore.getState().logsPage).toBe(9);
    expect(useAdminStore.getState().logsLimit).toBe(7);
    expect(useAdminStore.getState().logsTotal).toBe(0);
    expect(useAdminStore.getState().logsTotalPages).toBe(1);

    await useAdminStore.getState().fetchPosts();
    expect(useAdminStore.getState().posts).toHaveLength(1);
    expect(useAdminStore.getState().posts[0]).toMatchObject({
      id: 'p1',
      title: 'Post 1',
      content: 'Body',
      authorName: 'Author',
      removed: false,
      thumbnail: null,
      like: 5,
      dislike: 1,
    });

    c.GET.mockResolvedValueOnce({ data: {} });
    await useAdminStore.getState().fetchUsers();

    c.GET.mockResolvedValueOnce({ data: { data: { not: 'array' } } });
    await useAdminStore.getState().fetchPosts();
    expect(Array.isArray(useAdminStore.getState().posts)).toBe(true);

    c.GET.mockResolvedValueOnce({ data: { data: [{}] } });
    await useAdminStore.getState().fetchPosts();
    expect(useAdminStore.getState().posts[0]).toMatchObject({
      id: '',
      title: '',
      content: '',
      authorName: '',
      removed: false,
      thumbnail: null,
      like: 0,
      dislike: 0,
    });
  });

  it('updates users and posts via mutation actions', async () => {
    const c = makeClient();
    mocks.getAuthState.mockReturnValue({ getAuthClient: () => c });

    useAdminStore.setState({
      users: [
        {
          id: 'u1',
          email: 'u1@example.com',
          name: 'User 1',
          role: 'user',
          createdAt: '2026-03-01T00:00:00.000Z',
          status: 'active',
        },
        {
          id: 'u2',
          email: 'u2@example.com',
          name: 'User 2',
          role: 'user',
          createdAt: '2026-03-01T00:00:00.000Z',
          status: 'active',
        },
      ],
      posts: [
        {
          id: 'p1',
          title: 'Old',
          content: 'Old content',
          vertex: 'v',
          fragment: 'f',
          authorId: 'u1',
          authorName: 'User 1',
          createdAt: '2026-03-01T00:00:00.000Z',
          removed: false,
        },
        {
          id: 'p2',
          title: 'Keep',
          content: 'Keep content',
          vertex: 'v2',
          fragment: 'f2',
          authorId: 'u2',
          authorName: 'User 2',
          createdAt: '2026-03-01T00:00:00.000Z',
          removed: false,
        },
      ],
    });

    c.POST.mockResolvedValue({});
    c.PUT.mockResolvedValue({});
    c.PATCH.mockResolvedValue({});
    c.DELETE.mockResolvedValue({});

    await useAdminStore.getState().banUser('u1');
    expect(useAdminStore.getState().users[0].status).toBe('banned');
    expect(useAdminStore.getState().users[1].status).toBe('active');

    useAdminStore.getState().unbanUser('u1');
    expect(useAdminStore.getState().users[0].status).toBe('active');
    expect(useAdminStore.getState().users[1].status).toBe('active');

    await useAdminStore.getState().timeoutUser('u1', 120);
    expect(useAdminStore.getState().users[0].status).toBe('timed_out');
    expect(useAdminStore.getState().users[0].timeoutUntil).toBe('2026-03-31T02:00:00.000Z');
    expect(useAdminStore.getState().users[1].status).toBe('active');

    await useAdminStore.getState().promoteToModerator('u1');
    expect(useAdminStore.getState().users[0].role).toBe('moderator');
    expect(useAdminStore.getState().users[1].role).toBe('user');

    await useAdminStore.getState().demoteModerator('u1');
    expect(useAdminStore.getState().users[0].role).toBe('user');
    expect(useAdminStore.getState().users[1].role).toBe('user');

    await useAdminStore.getState().removePost('p1');
    expect(useAdminStore.getState().posts[0].removed).toBe(true);
    expect(useAdminStore.getState().posts[1].removed).toBe(false);

    await useAdminStore.getState().restorePost('p1');
    expect(useAdminStore.getState().posts[0].removed).toBe(false);
    expect(useAdminStore.getState().posts[1].removed).toBe(false);

    await useAdminStore.getState().editPost('p1', {
      title: 'New Title',
      content: 'New content',
      vertex: 'new-v',
      fragment: 'new-f',
    });
    expect(c.PUT).toHaveBeenCalledWith('/api/posts/{id}', {
      params: { path: { id: 'p1' } },
      body: {
        title: 'New Title',
        context: 'New content',
        vertex: 'new-v',
        fragment: 'new-f',
      },
    });
    expect(useAdminStore.getState().posts[0]).toMatchObject({
      title: 'New Title',
      content: 'New content',
      vertex: 'new-v',
      fragment: 'new-f',
    });
    expect(useAdminStore.getState().posts[1]).toMatchObject({
      id: 'p2',
      title: 'Keep',
      content: 'Keep content',
    });

    await useAdminStore.getState().deletePost('p1');
    expect(useAdminStore.getState().posts).toHaveLength(1);
    expect(useAdminStore.getState().posts[0].id).toBe('p2');
  });

  it('creates posts and handles no-postId response', async () => {
    const c = makeClient();
    mocks.getAuthState.mockReturnValue({ getAuthClient: () => c });

    c.POST.mockResolvedValueOnce({ data: { postId: 'new-post-id' } });
    const createdId = await useAdminStore.getState().createPost('My Post', 'u1', 'User 1');

    expect(createdId).toBe('new-post-id');
    expect(useAdminStore.getState().posts[0]).toMatchObject({
      id: 'new-post-id',
      title: 'My Post',
      authorId: 'u1',
      authorName: 'User 1',
      removed: false,
    });

    c.POST.mockResolvedValueOnce({ data: {} });
    const failedId = await useAdminStore.getState().createPost('No Id Post', 'u1', 'User 1');
    expect(failedId).toBeNull();
  });
});
