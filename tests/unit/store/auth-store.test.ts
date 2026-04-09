import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  clientPost: vi.fn(),
  authClient: vi.fn(),
  createAuthClientWithRefresh: vi.fn(),
}));

vi.mock('@/lib/api', () => ({
  client: {
    POST: (...args: any[]) => mocks.clientPost(...args),
  },
  authClient: (...args: any[]) => mocks.authClient(...args),
  createAuthClientWithRefresh: (...args: any[]) => mocks.createAuthClientWithRefresh(...args),
}));

import { useAuthStore } from '@/store/auth-store';

function resetAuthStore() {
  const initial = useAuthStore.getInitialState();
  useAuthStore.setState(initial, true);
}

describe('useAuthStore', () => {
  beforeEach(() => {
    mocks.clientPost.mockReset();
    mocks.authClient.mockReset();
    mocks.createAuthClientWithRefresh.mockReset();
    mocks.authClient.mockReturnValue({
      POST: vi.fn().mockResolvedValue({}),
      GET: vi.fn(),
      PUT: vi.fn(),
    });
    localStorage.clear();
    resetAuthStore();
  });

  it('sets hydration flag', () => {
    useAuthStore.getState().setHasHydrated(true);
    expect(useAuthStore.getState().hasHydrated).toBe(true);
  });

  it('logs in successfully and maps account data', async () => {
    mocks.clientPost.mockResolvedValue({ data: { token: 't-1', refreshToken: 'r-1' }, error: null });
    const accountClient = {
      GET: vi.fn().mockResolvedValue({
        data: {
          id: 'user-1',
          email: 'john@example.com',
          name: 'John',
          role: 'moderator',
          createdAt: '2026-03-01T00:00:00.000Z',
        },
      }),
    };
    mocks.authClient.mockReturnValue(accountClient);

    const ok = await useAuthStore.getState().login('john@example.com', 'secret');

    expect(ok).toBe(null);
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe('t-1');
    expect(state.refreshToken).toBe('r-1');
    expect(state.user).toMatchObject({
      id: 'user-1',
      email: 'john@example.com',
      name: 'John',
      role: 'moderator',
    });
    expect(state.isLoading).toBe(false);
  });

  it('handles login failures and exceptions', async () => {
    mocks.clientPost.mockResolvedValueOnce({ data: null, error: { message: 'bad' } });
    const failByError = await useAuthStore.getState().login('a@a.com', 'x');
    expect(failByError).toBe('Login failed');
    expect(useAuthStore.getState().isLoading).toBe(false);

    mocks.clientPost.mockRejectedValueOnce(new Error('network'));
    const failByThrow = await useAuthStore.getState().login('a@a.com', 'x');
    expect(failByThrow).toBe('Login failed');
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('registers successfully and supports register failure paths', async () => {
    mocks.clientPost.mockResolvedValueOnce({ data: { token: 't-2', refreshToken: 'r-2' }, error: null });
    mocks.authClient.mockReturnValue({
      GET: vi.fn().mockResolvedValue({
        data: {
          id: 'user-2',
          email: 'reg@example.com',
          name: 'Reg User',
          role: 'user',
          createdAt: '2026-03-01T00:00:00.000Z',
        },
      }),
    });

    const ok = await useAuthStore.getState().register('reg@example.com', 'pw', 'Reg User', 'user');
    expect(ok).toBe(null);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    mocks.clientPost.mockResolvedValueOnce({ data: null, error: { message: 'bad' } });
    const failByError = await useAuthStore.getState().register('reg@example.com', 'pw', 'Reg User', 'user');
    expect(failByError).toBe('Registration failed');

    mocks.clientPost.mockRejectedValueOnce(new Error('network'));
    const failByThrow = await useAuthStore.getState().register('reg@example.com', 'pw', 'Reg User', 'user');
    expect(failByThrow).toBe('Registration failed');
  });

  it('logs out with and without token', async () => {
    const logoutClient = {
      POST: vi.fn().mockRejectedValue(new Error('ignore me')),
    };
    mocks.authClient.mockReturnValue(logoutClient);

    useAuthStore.setState({
      user: {
        id: 'u',
        email: 'u@example.com',
        name: 'U',
        role: 'user',
        createdAt: '2026-03-01T00:00:00.000Z',
      },
      accessToken: 'token',
      refreshToken: 'refresh',
      isAuthenticated: true,
    });

    useAuthStore.getState().logout();

    expect(mocks.authClient).toHaveBeenCalledWith('token');
    expect(logoutClient.POST).toHaveBeenCalledWith('/api/auth/logout', { body: { refreshToken: 'refresh' } });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();

    mocks.authClient.mockClear();
    useAuthStore.getState().logout();
    expect(mocks.authClient).not.toHaveBeenCalled();
  });

  it('refreshes token and handles invalid/catch branches', async () => {
    expect(await useAuthStore.getState().refreshAccessToken()).toBe(false);

    useAuthStore.setState({ refreshToken: 'r-1', accessToken: 'old', isAuthenticated: true });
    mocks.clientPost.mockResolvedValueOnce({ data: { token: 'new' }, error: null });
    expect(await useAuthStore.getState().refreshAccessToken()).toBe(true);
    expect(useAuthStore.getState().accessToken).toBe('new');

    useAuthStore.setState({ refreshToken: 'r-1', accessToken: 'will-clear', isAuthenticated: true });
    mocks.clientPost.mockResolvedValueOnce({ data: null, error: { message: 'invalid' } });
    expect(await useAuthStore.getState().refreshAccessToken()).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();

    useAuthStore.setState({ refreshToken: 'r-1', accessToken: 'will-clear', isAuthenticated: true });
    mocks.clientPost.mockRejectedValueOnce(new Error('boom'));
    expect(await useAuthStore.getState().refreshAccessToken()).toBe(false);
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('returns proper auth client strategy', () => {
    expect(() => useAuthStore.getState().getAuthClient()).toThrow('Not authenticated');

    const plainClient = { name: 'plain-client', POST: vi.fn().mockResolvedValue({}) };
    mocks.authClient.mockReturnValue(plainClient);
    useAuthStore.setState({ accessToken: 'a-1', refreshToken: null, isAuthenticated: true });
    expect(useAuthStore.getState().getAuthClient()).toBe(plainClient);

    const refreshClient = { name: 'refresh-client' };
    mocks.createAuthClientWithRefresh.mockReturnValue(refreshClient);
    useAuthStore.setState({ accessToken: 'a-2', refreshToken: 'r-2', isAuthenticated: true });
    expect(useAuthStore.getState().getAuthClient()).toBe(refreshClient);

    const args = mocks.createAuthClientWithRefresh.mock.calls[0][0];
    args.onTokenRefreshed('a-3');
    expect(useAuthStore.getState().accessToken).toBe('a-3');

    useAuthStore.setState({
      user: {
        id: 'u',
        email: 'u@example.com',
        name: 'U',
        role: 'user',
        createdAt: '2026-03-01T00:00:00.000Z',
      },
      accessToken: 'a-4',
      refreshToken: 'r-4',
      isAuthenticated: true,
    });
    args.onRefreshFailed();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('sets auth from tokens and handles failure branches', async () => {
    const accountClient = {
      GET: vi.fn(),
    };
    mocks.authClient.mockReturnValue(accountClient);

    accountClient.GET.mockResolvedValueOnce({
      data: {
        id: 's-1',
        email: 'set@example.com',
        name: 'Set User',
        role: 'user',
        createdAt: '2026-03-01T00:00:00.000Z',
      },
    });
    expect(await useAuthStore.getState().setAuthFromTokens('token-a', 'refresh-a')).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    accountClient.GET.mockResolvedValueOnce({ data: null });
    expect(await useAuthStore.getState().setAuthFromTokens('token-b', 'refresh-b')).toBe(false);

    accountClient.GET.mockRejectedValueOnce(new Error('fail'));
    expect(await useAuthStore.getState().setAuthFromTokens('token-c', 'refresh-c')).toBe(false);
  });

  it('updates profile and updates token when backend returns one', async () => {
    useAuthStore.setState({
      user: {
        id: 'u-1',
        email: 'before@example.com',
        name: 'Before',
        role: 'user',
        createdAt: '2026-03-01T00:00:00.000Z',
      },
      accessToken: 'token-old',
      isAuthenticated: true,
    });

    const accountClient = {
      PUT: vi.fn().mockResolvedValue({ data: { token: 'token-new' } }),
    };
    mocks.authClient.mockReturnValue(accountClient);

    await useAuthStore.getState().updateProfile({ name: 'After', email: 'after@example.com' });

    expect(accountClient.PUT).toHaveBeenCalledWith('/api/account', { body: { name: 'After' } });
    expect(useAuthStore.getState().accessToken).toBe('token-new');
    expect(useAuthStore.getState().user).toMatchObject({
      name: 'After',
      email: 'after@example.com',
    });

    useAuthStore.setState({ user: null, accessToken: null, isAuthenticated: false });
    await useAuthStore.getState().updateProfile({ name: 'No User' });
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('covers fallback user mapping defaults and undefined refresh token in logout', async () => {
    const accountClient = {
      GET: vi.fn().mockResolvedValue({ data: {} }),
      POST: vi.fn().mockResolvedValue({}),
      PUT: vi.fn(),
    };
    mocks.authClient.mockReturnValue(accountClient);

    mocks.clientPost.mockResolvedValueOnce({ data: { token: 'login-fallback' }, error: null });
    expect(await useAuthStore.getState().login('fallback@example.com', 'pw')).toBe(null);
    expect(useAuthStore.getState().user).toMatchObject({
      id: '',
      email: 'fallback@example.com',
      name: '',
      role: 'user',
    });
    expect(useAuthStore.getState().refreshToken).toBeNull();

    useAuthStore.getState().logout();
    expect(accountClient.POST).toHaveBeenCalledWith('/api/auth/logout', {
      body: { refreshToken: undefined },
    });

    mocks.clientPost.mockResolvedValueOnce({ data: { token: 'register-fallback' }, error: null });
    expect(await useAuthStore.getState().register('reg-fallback@example.com', 'pw', 'Reg Name', 'user')).toBe(null);
    expect(useAuthStore.getState().user).toMatchObject({
      id: '',
      email: 'reg-fallback@example.com',
      name: 'Reg Name',
      role: 'user',
    });
    expect(useAuthStore.getState().refreshToken).toBeNull();

    accountClient.GET.mockResolvedValueOnce({ data: {} });
    expect(await useAuthStore.getState().setAuthFromTokens('token-fallback', undefined as unknown as string)).toBe(true);
    expect(useAuthStore.getState().user).toMatchObject({
      id: '',
      email: '',
      name: '',
      role: 'user',
    });
    expect(useAuthStore.getState().refreshToken).toBeNull();
  });
});
