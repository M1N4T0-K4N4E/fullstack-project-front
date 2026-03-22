'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';
import { useEventStore } from '@/store/event-store';
import { useTicketStore } from '@/store/ticket-store';
import { ticketsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketIcon, Search, Filter, QrCode } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Ticket } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function OrganizerTicketsPage() {
  const { user } = useAuthStore();
  const { setEvents, getEventsByOrganizer } = useEventStore();
  const { setTickets } = useTicketStore();
  const [organizerEvents, setOrganizerEventsState] = useState<ReturnType<typeof getEventsByOrganizer>>([]);
  const [allTickets, setAllTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvents();
    setTickets();
  }, [setEvents, setTickets]);

  useEffect(() => {
    if (user) {
      const events = getEventsByOrganizer(user.id);
      setOrganizerEventsState(events);

      // Get all tickets for organizer's events
      const tickets = events.flatMap((e) => ticketsApi.getByEvent(e.id));
      setAllTickets(tickets);
      setLoading(false);
    }
  }, [user, getEventsByOrganizer]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['organizer']}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Event Tickets</h1>
          <p className="text-muted-foreground">View tickets sold for your events</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Tickets</CardTitle>
              <Badge variant="outline">{allTickets.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : allTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tickets sold yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{ticket.eventTitle}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{ticket.userName}</span>
                        <span>{ticket.ticketType} x{ticket.quantity}</span>
                        <span>฿{ticket.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
                    <Link href={`/tickets/${ticket.id}`}>
                      <Button size="sm" variant="ghost">
                        <QrCode className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
