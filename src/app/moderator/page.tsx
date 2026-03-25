'use client';


import { useAdminStore } from '@/store/admin-store';
import { UsersIcon, TimerIcon, FileTextIcon, Trash2Icon } from 'lucide-react';
import { useEffect } from 'react';

const StatCard = ({
  label, value, icon: Icon, accent,
}: {
  label: string; value: number; icon: React.ElementType; accent?: string;
}) => (
  <div className="border rounded-lg p-4 flex items-start justify-between gap-4">
    <div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
    <div className={`p-2 rounded-md ${accent ?? 'bg-secondary'}`}>
      <Icon className="size-4" />
    </div>
  </div>
);

export default function ModeratorOverviewPage() {
  const { users, posts, fetchUsers, fetchPosts } = useAdminStore();

  useEffect(() => {
    fetchUsers();
    fetchPosts();
  }, []);

  const userStats = [
    { label: 'Total users', value: users.filter(u => u.role === 'user').length, icon: UsersIcon },
    { label: 'Timed out', value: users.filter(u => u.status === 'timed_out').length, icon: TimerIcon, accent: 'bg-yellow-500/10 text-yellow-400' },
  ];

  const contentStats = [
    { label: 'Live posts', value: posts.filter(p => !p.removed).length, icon: FileTextIcon },
    { label: 'Removed posts', value: posts.filter(p => p.removed).length, icon: Trash2Icon, accent: 'bg-destructive/15 text-destructive' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Moderation overview at a glance</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Users</h2>
        <div className="grid grid-cols-2 gap-3">
          {userStats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Content</h2>
        <div className="grid grid-cols-2 gap-3">
          {contentStats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>
    </div>
  );
}
