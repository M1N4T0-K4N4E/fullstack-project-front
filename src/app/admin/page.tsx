'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { usersApi, eventsApi, ticketsApi } from '@/lib/api';
import { NavHeader } from '@/components/shared/nav-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ users: 0, events: 0, tickets: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const users = usersApi.getAll();
    const events = eventsApi.getAll();
    const tickets = ticketsApi.getAll();
    const revenue = tickets.reduce((sum, t) => sum + t.price, 0);
    setStats({ users: users.length, events: events.length, tickets: tickets.length, revenue });
    setLoading(false);
  }, []);

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="w-full min-h-screen">
        <NavHeader />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Platform overview · Welcome, {user?.name}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold font-heading">{stats.users}</p>
              )}
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold font-heading">{stats.events}</p>
              )}
              <p className="text-sm text-muted-foreground">Total Events</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <Ticket className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold font-heading">{stats.tickets}</p>
              )}
              <p className="text-sm text-muted-foreground">Tickets Sold</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold font-heading">฿{stats.revenue.toLocaleString()}</p>
              )}
              <p className="text-sm text-muted-foreground">Total Revenue</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/admin/users">
              <div className="flex items-center justify-between p-5 rounded-xl border bg-card hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">User Management</p>
                    <p className="text-xs text-muted-foreground">View & manage all users</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/admin/events">
              <div className="flex items-center justify-between p-5 rounded-xl border bg-card hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500/10">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Event Management</p>
                    <p className="text-xs text-muted-foreground">Approve & manage events</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/admin/refunds">
              <div className="flex items-center justify-between p-5 rounded-xl border bg-card hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Refund Requests</p>
                    <p className="text-xs text-muted-foreground">Process refund queue</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
