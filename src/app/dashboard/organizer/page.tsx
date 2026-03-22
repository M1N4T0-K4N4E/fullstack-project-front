'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';
import { useEventStore } from '@/store/event-store';
import { useTicketStore } from '@/store/ticket-store';
import { NavHeader } from '@/components/shared/nav-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  Ticket,
  DollarSign,
  Eye,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Event } from '@/types';

export default function OrganizerDashboardPage() {
  const { user } = useAuthStore();
  const { setEvents, getEventsByOrganizer } = useEventStore();
  const { setTickets } = useTicketStore();
  const [events, setEventsState] = useState<Event[]>([]);

  useEffect(() => {
    setEvents();
    setTickets();
  }, [setEvents, setTickets]);

  useEffect(() => {
    if (user) {
      setEventsState(getEventsByOrganizer(user.id));
    }
  }, [user, getEventsByOrganizer]);

  const totalTicketsSold = events.reduce(
    (sum, event) => sum + event.ticketTypes.reduce((s, tt) => s + (tt.quantity - tt.available), 0),
    0
  );
  const totalRevenue = events.reduce(
    (sum, event) =>
      sum + event.ticketTypes.reduce((s, tt) => s + (tt.quantity - tt.available) * tt.price, 0),
    0
  );
  const totalViews = events.reduce((sum, e) => sum + e.views, 0);

  const statusColor: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <ProtectedRoute allowedRoles={['organizer']}>
      <div className="w-full min-h-screen">
        <NavHeader />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold">Organizer Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Welcome back, {user?.name}
              </p>
            </div>
            <Link href="/dashboard/organizer/events/create">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Create Event
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold font-heading">{events.length}</p>
              <p className="text-sm text-muted-foreground">My Events</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                  <Ticket className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold font-heading">{totalTicketsSold}</p>
              <p className="text-sm text-muted-foreground">Tickets Sold</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold font-heading">฿{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Revenue</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold font-heading">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Link href="/dashboard/organizer/events">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors">
                <div>
                  <p className="font-medium text-sm">Manage Events</p>
                  <p className="text-xs text-muted-foreground">Edit, publish, or cancel</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
            <Link href="/dashboard/organizer/tickets">
              <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/40 transition-colors">
                <div>
                  <p className="font-medium text-sm">View Tickets</p>
                  <p className="text-xs text-muted-foreground">Check-in & verify</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          </div>

          {/* My events */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold">My Events</h2>
              <Link href="/dashboard/organizer/events" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>

            {events.length === 0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm mb-3">No events yet</p>
                <Link href="/dashboard/organizer/events/create">
                  <Button variant="outline" size="sm">Create your first event</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => {
                  const sold = event.ticketTypes.reduce((s, tt) => s + (tt.quantity - tt.available), 0);
                  const total = event.ticketTypes.reduce((s, tt) => s + tt.quantity, 0);
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-4 p-4 rounded-xl border bg-card"
                    >
                      <img
                        src={event.banner}
                        alt={event.title}
                        className="w-14 h-14 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm truncate">{event.title}</p>
                          <Badge className={`text-xs shrink-0 ${statusColor[event.status]}`}>
                            {event.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.startDate), 'MMM d, yyyy')} · {sold}/{total} sold
                        </p>
                      </div>
                      <Link href={`/dashboard/organizer/events/${event.id}/edit`} className="shrink-0">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
