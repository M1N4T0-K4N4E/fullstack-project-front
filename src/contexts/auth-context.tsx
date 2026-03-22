'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';
import { validateCredentials, findUserByEmail, generateId, mockUsers } from '@/lib/mock-data';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'user' | 'organizer') => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'tickale_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as User;
        setState({ user, isAuthenticated: true, isLoading: false });
      } catch {
        localStorage.removeItem(STORAGE_KEY);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const user = validateCredentials(email, password);
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      setState({ user, isAuthenticated: true, isLoading: false });
      return true;
    }
    return false;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: 'user' | 'organizer'
  ): Promise<boolean> => {
    // Check if user already exists
    if (findUserByEmail(email)) {
      return false;
    }

    // Create new user
    const newUser: User = {
      id: generateId(),
      email,
      name,
      role,
      createdAt: new Date().toISOString(),
    };

    // Add to mock users (in real app, this would be an API call)
    mockUsers.push(newUser);

    // Auto login after registration
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setState({ user: newUser, isAuthenticated: true, isLoading: false });
    return true;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
