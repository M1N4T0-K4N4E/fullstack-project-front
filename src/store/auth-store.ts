import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { client, authClient, createAuthClientWithRefresh } from '@/lib/api';

type UserRoleCreatable = Exclude<UserRole, 'admin'>;

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRoleCreatable) => Promise<boolean>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  getAuthClient: () => ReturnType<typeof authClient>;
  setAuthFromTokens: (accessToken: string, refreshToken: string) => Promise<boolean>;
  updateProfile: (data: { name?: string; email?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await client.POST('/api/auth/login', {
            body: { email, password },
          });
          if (error || !data?.token) {
            set({ isLoading: false });
            return false;
          }
          const c = authClient(data.token);
          const { data: accountData } = await c.GET('/api/account');
          const user: User = {
            id: accountData?.id ?? '',
            email: accountData?.email ?? email,
            name: accountData?.name ?? '',
            role: (accountData?.role as UserRole) ?? 'user',
            createdAt: accountData?.createdAt ?? new Date().toISOString(),
          };
          set({
            user,
            accessToken: data.token,
            refreshToken: data.refreshToken ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await client.POST('/api/auth/register', {
            body: { email, password, name },
          });
          if (error || !data?.token) {
            set({ isLoading: false });
            return false;
          }
          const c = authClient(data.token);
          const { data: accountData } = await c.GET('/api/account');
          const user: User = {
            id: accountData?.id ?? '',
            email: accountData?.email ?? email,
            name: accountData?.name ?? name,
            role: (accountData?.role as UserRole) ?? 'user',
            createdAt: accountData?.createdAt ?? new Date().toISOString(),
          };
          set({
            user,
            accessToken: data.token,
            refreshToken: data.refreshToken ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        const { accessToken, refreshToken } = get();
        if (accessToken) {
          const c = authClient(accessToken);
          c.POST('/api/auth/logout', {
            body: { refreshToken: refreshToken ?? undefined },
          }).catch(() => {});
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;
        try {
          const { data, error } = await client.POST('/api/auth/refresh', {
            body: { refreshToken },
          });
          if (error || !data?.token) {
            // Refresh token is invalid — force logout
            get().logout();
            return false;
          }
          set({ accessToken: data.token });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      getAuthClient: () => {
        const { accessToken, refreshToken } = get();
        if (!accessToken) {
          throw new Error('Not authenticated');
        }
        if (!refreshToken) {
          return authClient(accessToken);
        }
        return createAuthClientWithRefresh({
          accessToken,
          refreshToken,
          onTokenRefreshed: (newToken) => set({ accessToken: newToken }),
          onRefreshFailed: () => get().logout(),
        });
      },

      setAuthFromTokens: async (accessToken: string, refreshToken: string) => {
        set({ isLoading: true });
        try {
          const c = authClient(accessToken);
          const { data: accountData } = await c.GET('/api/account');
          if (!accountData) {
            set({ isLoading: false });
            return false;
          }
          const user: User = {
            id: accountData.id ?? '',
            email: accountData.email ?? '',
            name: accountData.name ?? '',
            role: (accountData.role as UserRole) ?? 'user',
            createdAt: accountData.createdAt ?? new Date().toISOString(),
          };
          set({
            user,
            accessToken,
            refreshToken: refreshToken ?? null,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      updateProfile: async (data: { name?: string; email?: string }) => {
        const { accessToken } = get();
        if (data.name && accessToken) {
          const c = authClient(accessToken);
          const { data: result } = await c.PUT('/api/account', { body: { name: data.name } });
          if (result?.token) {
            set({ accessToken: result.token });
          }
        }
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: 'tickale-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
