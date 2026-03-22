'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useEventStore } from '@/store/event-store';
import { useTicketStore } from '@/store/ticket-store';
import { eventsApi, ticketsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, TicketIcon, DollarSign, Plus, ArrowRight, Eye } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function OrganizerDashboardPage() {
  const { user } = useAuthStore();
  const { setEvents, getEventsByOrganizer } = useEventStore();
  const { setTickets } = useTicketStore();
  const [events, setEventsState] = useState<ReturnType<typeof getEventsByOrganizer>>([]);

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
      sum +
      event.ticketTypes.reduce(
        (s, tt) => s + (tt.quantity - tt.available) * tt.price,
        0
      ),
    0
  );
  const totalViews = events.reduce((sum, e) => sum + e.views, 0);

  return (
    <ProtectedRoute allowedRoles={['organizer']}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Organizer Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Link href="/dashboard/organizer/events/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Event
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">My Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Sold</CardTitle>
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTicketsSold}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">฿{totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link href="/dashboard/organizer/events">
            <Button variant="outline">
              Manage Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard/organizer/tickets">
            <Button variant="outline">
              View Tickets
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* My Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Events</CardTitle>
            <Link href="/dashboard/organizer/events">
              <Button size="sm" variant="ghost">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No events yet</p>
                <Link href="/dashboard/organizer/events/create">
                  <Button variant="link" className="mt-2">
                    Create your first event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {events.slice(0, 5).map((event) => {
                  const ticketsSold = event.ticketTypes.reduce(
                    (s, tt) => s + (tt.quantity - tt.available),
                    0
                  );
                  const totalCapacity = event.ticketTypes.reduce((s, tt) => s + tt.quantity, 0);
                  return (
                    <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={event.banner}
                        alt={event.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticketsSold} / {totalCapacity} tickets sold
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/organizer/events/${event.id}/edit`}>
                          <Button size="sm" variant="outline">
                            Edit
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
