import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { client, authClient } from '@/lib/api';

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
