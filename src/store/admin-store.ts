import { create } from 'zustand';
import { User } from '@/types';
import { useAuthStore } from '@/store/auth-store';

export type UserStatus = 'active' | 'banned' | 'timed_out';

export interface ManagedUser extends User {
  status: UserStatus;
  timeoutUntil?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  username: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  vertex: string;
  fragment: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  removed: boolean;
  thumbnail?: string | null;
  like?: number;
  dislike?: number;
}

interface AdminStore {
  users: ManagedUser[];
  logs: ActivityLog[];
  posts: Post[];
  isLoadingUsers: boolean;
  isLoadingPosts: boolean;
  isLoadingLogs: boolean;
  fetchUsers: () => Promise<void>;
  fetchLogs: () => Promise<void>;
  fetchPosts: () => Promise<void>;
  banUser: (id: string) => Promise<void>;
  unbanUser: (id: string) => void;
  timeoutUser: (id: string, minutes: number) => Promise<void>;
  promoteToModerator: (id: string) => Promise<void>;
  demoteModerator: (id: string) => Promise<void>;
  removePost: (id: string) => Promise<void>;
  restorePost: (id: string) => void;
  createPost: (title: string, authorId: string, authorName: string) => Promise<string | null>;
  editPost: (id: string, data: Partial<Pick<Post, 'title' | 'content' | 'vertex' | 'fragment'>>) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
}

function getClient() {
  try {
    return useAuthStore.getState().getAuthClient();
  } catch {
    return null;
  }
}

const defaultVertex = `attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 0, 1);
}
`;

const defaultFragment = `precision highp float;

uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(uTime), 1.0);
}
`;

const seedLogs: ActivityLog[] = [
  { id: 'log-1', userId: 'user-1', username: 'John Doe', action: 'uploaded shader', target: 'Transition Shader #42', timestamp: '2026-03-24T09:12:00Z' },
  { id: 'log-2', userId: 'user-2', username: 'Alice Kim', action: 'liked', target: 'Transition Shader #42', timestamp: '2026-03-24T09:15:00Z' },
  { id: 'log-3', userId: 'user-3', username: 'Bob Chen', action: 'commented', target: 'Noise Shader #17', timestamp: '2026-03-24T08:44:00Z' },
  { id: 'log-4', userId: 'user-4', username: 'Spammer Guy', action: 'uploaded shader', target: 'BUY CHEAP MEDS NOW', timestamp: '2026-03-23T22:01:00Z' },
  { id: 'log-5', userId: 'user-1', username: 'John Doe', action: 'edited shader', target: 'Transition Shader #42', timestamp: '2026-03-23T18:30:00Z' },
  { id: 'log-6', userId: 'moderator-1', username: 'Music Productions', action: 'removed post', target: 'BUY CHEAP MEDS NOW', timestamp: '2026-03-23T22:15:00Z' },
];

export const useAdminStore = create<AdminStore>((set) => ({
  users: [],
  logs: seedLogs,
  posts: [],
  isLoadingUsers: false,
  isLoadingPosts: false,
  isLoadingLogs: false,

  fetchUsers: async () => {
    const c = getClient();
    if (!c) return;
    set({ isLoadingUsers: true });
    try {
      const { data } = await c.GET('/api/users');
      if (data?.data) {
        const mapped: ManagedUser[] = data.data.map((u) => ({
          id: u.id ?? '',
          email: u.email ?? '',
          name: u.name ?? '',
          role: (u.role as ManagedUser['role']) ?? 'user',
          createdAt: u.createdAt ?? new Date().toISOString(),
          status: (u.status as UserStatus) ?? 'active',
        }));
        set({ users: mapped });
      }
    } finally {
      set({ isLoadingUsers: false });
    }
  },

  fetchLogs: async () => {
    const c = getClient();
    if (!c) return;
    set({ isLoadingLogs: true });
    try {
      const { data } = await c.GET('/api/logs/user', { query: { page: 1, limit: 100 } });
      const mapped: ActivityLog[] = (data?.data ?? []).map((log) => {
        const path = log.path ?? '';
        const method = log.method ?? 'UNKNOWN';
        const status = log.status ?? 0;
        const target = path ? `${method} ${path} [${status}]` : '—';

        return {
          id: log.id ?? `${log.userId ?? 'guest'}-${log.createdAt ?? Date.now()}`,
          userId: log.userId ?? 'guest',
          username: log.userEmail ?? 'Guest',
          action: log.action ?? 'unknown',
          target,
          timestamp: log.createdAt ?? new Date().toISOString(),
        };
      });

      set({ logs: mapped });
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  fetchPosts: async () => {
    const c = getClient();
    if (!c) return;
    const { data } = await c.GET('/api/posts');
    if (data?.data) {
      const mapped: Post[] = (Array.isArray(data.data) ? data.data : []).map((p) => ({
        id: p.id ?? '',
        title: p.title ?? '',
        content: p.context ?? '',
        vertex: defaultVertex,
        fragment: defaultFragment,
        authorId: '',
        authorName: p.user?.name ?? '',
        createdAt: p.createdAt ?? new Date().toISOString(),
        removed: false,
        thumbnail: p.thumbnail ?? null,
        like: p.like ?? 0,
        dislike: p.dislike ?? 0,
      }));
      set({ posts: mapped });
    }
  },

  banUser: async (id) => {
    const c = getClient();
    if (!c) return;
    await c.PUT('/api/account/ban', { body: { userId: id } });
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, status: 'banned', timeoutUntil: undefined } : u)),
    }));
  },

  unbanUser: (id) => set((s) => ({
    users: s.users.map((u) => (u.id === id ? { ...u, status: 'active', timeoutUntil: undefined } : u)),
  })),

  timeoutUser: async (id, minutes) => {
    const c = getClient();
    if (!c) return;
    const durationHours = minutes / 60;
    await c.POST('/api/users/timeout/{id}', { params: { path: { id } }, body: { duration: durationHours } });
    set((s) => ({
      users: s.users.map((u) =>
        u.id === id
          ? { ...u, status: 'timed_out', timeoutUntil: new Date(Date.now() + minutes * 60000).toISOString() }
          : u
      ),
    }));
  },

  promoteToModerator: async (id) => {
    const c = getClient();
    if (!c) return;
    await c.PUT('/api/roles', { body: { id, role: 'moderator' } });
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, role: 'moderator' } : u)),
    }));
  },

  demoteModerator: async (id) => {
    const c = getClient();
    if (!c) return;
    await c.PUT('/api/roles', { body: { id, role: 'user' } });
    set((s) => ({
      users: s.users.map((u) => (u.id === id ? { ...u, role: 'user' } : u)),
    }));
  },

  removePost: async (id) => {
    const c = getClient();
    if (!c) return;
    await c.DELETE('/api/posts/{id}', { params: { path: { id } } });
    set((s) => ({
      posts: s.posts.map((p) => (p.id === id ? { ...p, removed: true } : p)),
    }));
  },

  restorePost: (id) => set((s) => ({
    posts: s.posts.map((p) => (p.id === id ? { ...p, removed: false } : p)),
  })),

  createPost: async (title, _authorId, _authorName) => {
    const c = getClient();
    if (!c) return null;
    const { data } = await c.POST('/api/posts', { body: { title } });
    if (data?.postId) {
      const newPost: Post = {
        id: data.postId,
        title,
        content: '',
        vertex: defaultVertex,
        fragment: defaultFragment,
        authorId: _authorId,
        authorName: _authorName,
        createdAt: new Date().toISOString(),
        removed: false,
      };
      set((s) => ({ posts: [newPost, ...s.posts] }));
      return data.postId;
    }
    return null;
  },

  editPost: async (id, data) => {
    const c = getClient();
    if (!c) return;
    await c.PUT('/api/posts/{id}', {
      params: { path: { id } },
      body: {
        title: data.title,
        context: data.content,
        vertex: data.vertex,
        fragment: data.fragment,
      },
    });
    set((s) => ({
      posts: s.posts.map((p) => (p.id === id ? { ...p, ...data } : p)),
    }));
  },

  deletePost: async (id) => {
    const c = getClient();
    if (!c) return;
    await c.DELETE('/api/posts/{id}', { params: { path: { id } } });
    set((s) => ({ posts: s.posts.filter((p) => p.id !== id) }));
  },
}));
