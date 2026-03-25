import createClient, { type Middleware } from "openapi-fetch";
import { paths } from "./path-api";

export const client = createClient<paths>({ baseUrl: "/" });

export function authClient(token: string) {
  return createClient<paths>({
    baseUrl: "/",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function createAuthClientWithRefresh({
  accessToken,
  refreshToken,
  onTokenRefreshed,
  onRefreshFailed,
}: {
  accessToken: string;
  refreshToken: string;
  onTokenRefreshed: (newAccessToken: string) => void;
  onRefreshFailed: () => void;
}) {
  let currentToken = accessToken;
  let isRefreshing: Promise<string | null> | null = null;

  async function doRefresh(): Promise<string | null> {
    const { data, error } = await client.POST("/api/auth/refresh", {
      body: { refreshToken },
    });
    if (error || !data?.token) {
      onRefreshFailed();
      return null;
    }
    onTokenRefreshed(data.token);
    currentToken = data.token;
    return data.token;
  }

  const refreshMiddleware: Middleware = {
    async onRequest({ request }) {
      request.headers.set("Authorization", `Bearer ${currentToken}`);
      return request;
    },
    async onResponse({ request, response }) {
      if (response.status !== 401) return response;

      if (!isRefreshing) {
        isRefreshing = doRefresh().finally(() => {
          isRefreshing = null;
        });
      }

      const newToken = await isRefreshing;
      if (!newToken) return response;

      const retryRequest = request.clone();
      retryRequest.headers.set("Authorization", `Bearer ${newToken}`);
      return fetch(retryRequest);
    },
  };

  const c = createClient<paths>({ baseUrl: "/" });
  c.use(refreshMiddleware);
  return c;
}
