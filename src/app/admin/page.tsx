'use client';

import Link from 'next/link';
import { useAdminStore } from '@/store/admin-store';
import { UsersIcon, BanIcon, TimerIcon, ShieldIcon, ActivityIcon, FileTextIcon, Trash2Icon, LayoutDashboardIcon } from 'lucide-react';
import { DateTime } from 'luxon';

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

export default function AdminOverviewPage() {
  const { users, logs, posts } = useAdminStore();

  const userStats = [
    { label: 'Total users',  value: users.length,                                   icon: UsersIcon },
    { label: 'Moderators',   value: users.filter(u => u.role === 'moderator').length, icon: ShieldIcon },
    { label: 'Banned',       value: users.filter(u => u.status === 'banned').length,  icon: BanIcon,   accent: 'bg-destructive/15 text-destructive' },
    { label: 'Timed out',    value: users.filter(u => u.status === 'timed_out').length, icon: TimerIcon, accent: 'bg-yellow-500/10 text-yellow-400' },
  ];

  const contentStats = [
    { label: 'Activity logs',  value: logs.length,                          icon: ActivityIcon },
    { label: 'Live posts',     value: posts.filter(p => !p.removed).length,  icon: FileTextIcon },
    { label: 'Removed posts',  value: posts.filter(p => p.removed).length,   icon: Trash2Icon,  accent: 'bg-destructive/15 text-destructive' },
  ];

  const recentLogs = [...logs]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Platform health at a glance</p>
      </div>

      {/* Users */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Users</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {userStats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* Content */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Content</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {contentStats.map(s => <StatCard key={s.label} {...s} />)}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Recent activity</h2>
          <Link href="/admin/activity" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View all →
          </Link>
        </div>
        <div className="border rounded-lg divide-y">
          {recentLogs.map(log => (
            <div key={log.id} className="flex items-center justify-between px-4 py-3 gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-7 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <ActivityIcon className="size-3.5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-medium">{log.username}</span>
                  <span className="text-sm text-muted-foreground"> {log.action}</span>
                  {log.target && (
                    <span className="text-sm text-muted-foreground truncate"> · {log.target}</span>
                  )}
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                {DateTime.fromISO(log.timestamp).toFormat('MMM dd, HH:mm')}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
