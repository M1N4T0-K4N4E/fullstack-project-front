import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  clients: [] as any[],
  refreshPost: vi.fn(),
}));

vi.mock('openapi-fetch', () => {
  const createClient = vi.fn((opts: any) => {
    const c: any = {
      opts,
      middleware: undefined,
      use: vi.fn((mw: any) => {
        c.middleware = mw;
      }),
      POST: vi.fn(),
      GET: vi.fn(),
      PUT: vi.fn(),
      PATCH: vi.fn(),
      DELETE: vi.fn(),
    };
    hoisted.clients.push(c);
    return c;
  });

  return {
    default: createClient,
  };
});

import { authClient, client, createAuthClientWithRefresh } from '@/lib/api';

describe('api client helpers', () => {
  beforeEach(() => {
    hoisted.clients.length = 0;
    hoisted.refreshPost.mockReset();
    vi.restoreAllMocks();
  });

  it('creates base client and auth client with expected options', () => {
    expect(client).toBeTruthy();

    const c = authClient('abc-123');
    expect(c).toBeTruthy();

    expect(hoisted.clients.at(-1).opts).toEqual({
      baseUrl: '/',
      headers: { Authorization: 'Bearer abc-123' },
    });
  });

  it('refreshes token on 401 and retries request', async () => {
    hoisted.refreshPost.mockResolvedValue({ data: { token: 'new-token' }, error: null });

    (client as any).POST = hoisted.refreshPost;

    const fetchMock = vi.fn().mockResolvedValue(new Response('retried', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const onTokenRefreshed = vi.fn();
    const onRefreshFailed = vi.fn();

    const c = createAuthClientWithRefresh({
      accessToken: 'old-token',
      refreshToken: 'refresh-token',
      onTokenRefreshed,
      onRefreshFailed,
    }) as any;

    const middleware = c.middleware;
    expect(middleware).toBeTruthy();

    const req = new Request('http://localhost/a');
    const decorated = await middleware.onRequest({ request: req });
    expect(decorated.headers.get('Authorization')).toBe('Bearer old-token');

    const non401 = new Response('', { status: 200 });
    expect(await middleware.onResponse({ request: req, response: non401 })).toBe(non401);

    const response401 = new Response('', { status: 401 });
    const retried = await middleware.onResponse({ request: new Request('http://localhost/b'), response: response401 });

    expect(hoisted.refreshPost).toHaveBeenCalledWith('/api/auth/refresh', {
      body: { refreshToken: 'refresh-token' },
    });
    expect(onTokenRefreshed).toHaveBeenCalledWith('new-token');
    expect(onRefreshFailed).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(retried.status).toBe(200);

    const reqAfterRefresh = new Request('http://localhost/c');
    const decoratedAfterRefresh = await middleware.onRequest({ request: reqAfterRefresh });
    expect(decoratedAfterRefresh.headers.get('Authorization')).toBe('Bearer new-token');
  });

  it('returns original response when refresh fails and deduplicates concurrent refresh', async () => {
    type RefreshResult = { data: { token: string } | null; error: { message: string } | null };

    let resolveRefresh!: (value: RefreshResult) => void;
    const refreshPromise = new Promise<RefreshResult>((resolve) => {
      resolveRefresh = resolve;
    });

    hoisted.refreshPost.mockImplementationOnce(() => refreshPromise as Promise<any>);
    (client as any).POST = hoisted.refreshPost;

    const fetchMock = vi.fn().mockResolvedValue(new Response('retried', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const c = createAuthClientWithRefresh({
      accessToken: 'old-token',
      refreshToken: 'refresh-token',
      onTokenRefreshed: vi.fn(),
      onRefreshFailed: vi.fn(),
    }) as any;

    const middleware = c.middleware;

    const r1 = middleware.onResponse({ request: new Request('http://localhost/d'), response: new Response('', { status: 401 }) });
    const r2 = middleware.onResponse({ request: new Request('http://localhost/e'), response: new Response('', { status: 401 }) });

    expect(hoisted.refreshPost).toHaveBeenCalledTimes(1);

    resolveRefresh({ data: { token: 'concurrent-token' }, error: null });
    await Promise.all([r1, r2]);

    hoisted.refreshPost.mockResolvedValueOnce({ data: null, error: { message: 'bad refresh' } });
    const onRefreshFailed = vi.fn();
    const c2 = createAuthClientWithRefresh({
      accessToken: 'x',
      refreshToken: 'y',
      onTokenRefreshed: vi.fn(),
      onRefreshFailed,
    }) as any;

    const middleware2 = c2.middleware;
    const original401 = new Response('', { status: 401 });
    const returned = await middleware2.onResponse({ request: new Request('http://localhost/f'), response: original401 });

    expect(onRefreshFailed).toHaveBeenCalledTimes(1);
    expect(returned).toBe(original401);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
