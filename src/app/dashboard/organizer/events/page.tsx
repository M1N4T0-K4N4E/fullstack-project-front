'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';
import { useEventStore } from '@/store/event-store';
import { NavHeader } from '@/components/shared/nav-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Calendar, MapPin, Eye, Edit } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Event } from '@/types';

export default function OrganizerEventsPage() {
  const { user } = useAuthStore();
  const { setEvents, getEventsByOrganizer, isLoading } = useEventStore();
  const [events, setEventsState] = useState<Event[]>([]);

  useEffect(() => {
    setEvents();
  }, [setEvents]);

  useEffect(() => {
    if (user) {
      setEventsState(getEventsByOrganizer(user.id));
    }
  }, [user, getEventsByOrganizer]);

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
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold">My Events</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {events.length} event{events.length !== 1 ? 's' : ''} created
              </p>
            </div>
            <Link href="/dashboard/organizer/events/create">
              <Button size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Create Event
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-xl border border-dashed p-14 text-center">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium mb-1">No events yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first event and start selling tickets.
              </p>
              <Link href="/dashboard/organizer/events/create">
                <Button variant="outline" size="sm">Create Event</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
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
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{event.title}</p>
                        <Badge className={`text-xs shrink-0 ${statusColor[event.status]}`}>
                          {event.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground">
                        <span>{sold}/{total} tickets sold</span>
                        <span>{event.views} views</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Link href={`/events/${event.id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/dashboard/organizer/events/${event.id}/edit`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
