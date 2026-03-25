import { create } from 'zustand';
import { User } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
}

interface AdminStore {
  users: ManagedUser[];
  logs: ActivityLog[];
  posts: Post[];
  banUser: (id: string) => void;
  unbanUser: (id: string) => void;
  timeoutUser: (id: string, minutes: number) => void;
  promoteToModerator: (id: string) => void;
  demoteModerator: (id: string) => void;
  removePost: (id: string) => void;
  restorePost: (id: string) => void;
  createPost: (title: string, authorId: string, authorName: string) => void;
  editPost: (id: string, data: Partial<Pick<Post, 'title' | 'content' | 'vertex' | 'fragment'>>) => void;
  deletePost: (id: string) => void;
}

const seedUsers: ManagedUser[] = [
  { id: 'user-1', email: 'john@example.com', name: 'John Doe', role: 'user', createdAt: '2024-01-15T10:00:00Z', status: 'active' },
  { id: 'user-2', email: 'alice@example.com', name: 'Alice Kim', role: 'user', createdAt: '2024-02-03T08:30:00Z', status: 'active' },
  { id: 'user-3', email: 'bob@example.com', name: 'Bob Chen', role: 'user', createdAt: '2024-03-10T14:00:00Z', status: 'timed_out', timeoutUntil: '2026-03-25T00:00:00Z' },
  { id: 'user-4', email: 'spammer@bad.com', name: 'Spammer Guy', role: 'user', createdAt: '2024-04-01T00:00:00Z', status: 'banned' },
  { id: 'moderator-1', email: 'mod@shaderd.com', name: 'Music Productions', role: 'moderator', createdAt: '2024-01-10T08:00:00Z', status: 'active' },
];

const seedLogs: ActivityLog[] = [
  { id: 'log-1', userId: 'user-1', username: 'John Doe', action: 'uploaded shader', target: 'Transition Shader #42', timestamp: '2026-03-24T09:12:00Z' },
  { id: 'log-2', userId: 'user-2', username: 'Alice Kim', action: 'liked', target: 'Transition Shader #42', timestamp: '2026-03-24T09:15:00Z' },
  { id: 'log-3', userId: 'user-3', username: 'Bob Chen', action: 'commented', target: 'Noise Shader #17', timestamp: '2026-03-24T08:44:00Z' },
  { id: 'log-4', userId: 'user-4', username: 'Spammer Guy', action: 'uploaded shader', target: 'BUY CHEAP MEDS NOW', timestamp: '2026-03-23T22:01:00Z' },
  { id: 'log-5', userId: 'user-1', username: 'John Doe', action: 'edited shader', target: 'Transition Shader #42', timestamp: '2026-03-23T18:30:00Z' },
  { id: 'log-6', userId: 'moderator-1', username: 'Music Productions', action: 'removed post', target: 'BUY CHEAP MEDS NOW', timestamp: '2026-03-23T22:15:00Z' },
  { id: 'log-7', userId: 'user-2', username: 'Alice Kim', action: 'registered', target: '', timestamp: '2024-02-03T08:30:00Z' },
];

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

const seedPosts: Post[] = [
  { id: 'post-1', title: 'Transition Shader With Patterns', content: '<p>A smooth transition shader using Voronoi patterns.</p>', vertex: defaultVertex, fragment: defaultFragment, authorId: 'user-1', authorName: 'John Doe', createdAt: '2026-03-23T18:30:00Z', removed: false },
  { id: 'post-2', title: 'Noise Shader #17', content: '<p>Simplex noise based shader effect.</p>', vertex: defaultVertex, fragment: defaultFragment, authorId: 'user-3', authorName: 'Bob Chen', createdAt: '2026-03-22T12:00:00Z', removed: false },
  { id: 'post-3', title: 'BUY CHEAP MEDS NOW', content: '<p>spam</p>', vertex: defaultVertex, fragment: defaultFragment, authorId: 'user-4', authorName: 'Spammer Guy', createdAt: '2026-03-23T22:01:00Z', removed: true },
  { id: 'post-4', title: 'Raymarching Basics', content: '<p>An introduction to raymarching techniques in GLSL.</p>', vertex: defaultVertex, fragment: defaultFragment, authorId: 'user-2', authorName: 'Alice Kim', createdAt: '2026-03-21T10:00:00Z', removed: false },
  { id: 'post-5', title: 'Procedural Sky', content: '<p>Procedural sky rendering with atmospheric scattering.</p>', vertex: defaultVertex, fragment: defaultFragment, authorId: 'user-1', authorName: 'John Doe', createdAt: '2026-03-20T09:00:00Z', removed: false },
];

export const useAdminStore = create<AdminStore>((set) => ({
  users: seedUsers,
  logs: seedLogs,
  posts: seedPosts,

  banUser: (id) => set((s) => ({
    users: s.users.map(u => u.id === id ? { ...u, status: 'banned', timeoutUntil: undefined } : u),
    logs: [{ id: uuidv4(), userId: 'admin-1', username: 'Admin', action: 'banned user', target: s.users.find(u => u.id === id)?.name ?? id, timestamp: new Date().toISOString() }, ...s.logs],
  })),

  unbanUser: (id) => set((s) => ({
    users: s.users.map(u => u.id === id ? { ...u, status: 'active', timeoutUntil: undefined } : u),
    logs: [{ id: uuidv4(), userId: 'admin-1', username: 'Admin', action: 'unbanned user', target: s.users.find(u => u.id === id)?.name ?? id, timestamp: new Date().toISOString() }, ...s.logs],
  })),

  timeoutUser: (id, minutes) => set((s) => ({
    users: s.users.map(u => u.id === id ? { ...u, status: 'timed_out', timeoutUntil: new Date(Date.now() + minutes * 60000).toISOString() } : u),
    logs: [{ id: uuidv4(), userId: 'admin-1', username: 'Admin', action: `timed out user for ${minutes}m`, target: s.users.find(u => u.id === id)?.name ?? id, timestamp: new Date().toISOString() }, ...s.logs],
  })),

  promoteToModerator: (id) => set((s) => ({
    users: s.users.map(u => u.id === id ? { ...u, role: 'moderator' } : u),
    logs: [{ id: uuidv4(), userId: 'admin-1', username: 'Admin', action: 'promoted to moderator', target: s.users.find(u => u.id === id)?.name ?? id, timestamp: new Date().toISOString() }, ...s.logs],
  })),

  demoteModerator: (id) => set((s) => ({
    users: s.users.map(u => u.id === id ? { ...u, role: 'user' } : u),
    logs: [{ id: uuidv4(), userId: 'admin-1', username: 'Admin', action: 'removed moderator', target: s.users.find(u => u.id === id)?.name ?? id, timestamp: new Date().toISOString() }, ...s.logs],
  })),

  removePost: (id) => set((s) => ({
    posts: s.posts.map(p => p.id === id ? { ...p, removed: true } : p),
    logs: [{ id: uuidv4(), userId: 'admin-1', username: 'Admin', action: 'removed post', target: s.posts.find(p => p.id === id)?.title ?? id, timestamp: new Date().toISOString() }, ...s.logs],
  })),

  restorePost: (id) => set((s) => ({
    posts: s.posts.map(p => p.id === id ? { ...p, removed: false } : p),
  })),

  createPost: (title, authorId, authorName) => set((s) => ({
    posts: [{ id: uuidv4(), title, content: '', vertex: defaultVertex, fragment: defaultFragment, authorId, authorName, createdAt: new Date().toISOString(), removed: false }, ...s.posts],
  })),

  editPost: (id, data) => set((s) => ({
    posts: s.posts.map(p => p.id === id ? { ...p, ...data } : p),
  })),

  deletePost: (id) => set((s) => ({
    posts: s.posts.filter(p => p.id !== id),
  })),
}));
