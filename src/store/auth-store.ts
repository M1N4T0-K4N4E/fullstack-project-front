import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { validateCredentials, findUserByEmail, generateId } from '@/lib/mock-data';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'user' | 'organizer') => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

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

      register: async (email: string, password: string, name: string, role: 'user' | 'organizer') => {
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
          role,
          createdAt: new Date().toISOString(),
        };
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'tickale-auth',
    }
  )
);
