'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';
import { useEventStore } from '@/store/event-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Edit, Eye, Calendar, MapPin } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function OrganizerEventsPage() {
  const { user } = useAuthStore();
  const { setEvents, getEventsByOrganizer, isLoading } = useEventStore();
  const [events, setEventsState] = useState<ReturnType<typeof getEventsByOrganizer>>([]);

  useEffect(() => {
    setEvents();
  }, [setEvents]);

  useEffect(() => {
    if (user) {
      setEventsState(getEventsByOrganizer(user.id));
    }
  }, [user, getEventsByOrganizer]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['organizer']}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Events</h1>
            <p className="text-muted-foreground">Manage your events</p>
          </div>
          <Link href="/dashboard/organizer/events/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No events yet</p>
                <Link href="/dashboard/organizer/events/create">
                  <Button variant="link" className="mt-2">
                    Create your first event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {events.map((event) => {
                  const ticketsSold = event.ticketTypes.reduce(
                    (s, tt) => s + (tt.quantity - tt.available),
                    0
                  );
                  const totalCapacity = event.ticketTypes.reduce((s, tt) => s + tt.quantity, 0);
                  return (
                    <div key={event.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                      <img
                        src={event.banner}
                        alt={event.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{event.title}</p>
                          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
                          <MapPin className="w-3 h-3 ml-2" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>{ticketsSold} / {totalCapacity} tickets sold</span>
                          <span>{event.views} views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/events/${event.id}`}>
                          <Button size="icon" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/organizer/events/${event.id}/edit`}>
                          <Button size="icon" variant="ghost">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
