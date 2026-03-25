import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { validateCredentials, findUserByEmail, generateId } from '@/mock-data';

type UserRoleCreatable = Exclude<UserRole, 'admin'>;

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: UserRoleCreatable) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { name?: string; email?: string }) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,
      setHasHydrated: (value: boolean) => set({ hasHydrated: value }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const user = validateCredentials(email, password);
        if (user) {
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        }
        set({ isLoading: false });
        return false;
      },

      register: async (email: string, password: string, name: string, role: UserRoleCreatable) => {
        set({ isLoading: true });
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        const existingUser = findUserByEmail(email);
        if (existingUser) {
          set({ isLoading: false });
          return false;
        }
        const newUser: User = {
          id: generateId(),
          email,
          name,
          role: role,
          createdAt: new Date().toISOString(),
        };
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (data) => {
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
