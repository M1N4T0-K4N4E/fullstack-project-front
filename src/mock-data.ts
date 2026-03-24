import { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'user',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'moderator-1',
    email: 'mod@shaderd.com',
    name: 'Music Productions',
    role: 'moderator',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'admin-1',
    email: 'admin@shaderd.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export const generateId = (): string => uuidv4();
export const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(u => u.email === email);
};

export const validateCredentials = (email: string, password: string): User | null => {
  const user = findUserByEmail(email);
  if (user && password.length >= 1) {
    return user;
  }
  return null;
};