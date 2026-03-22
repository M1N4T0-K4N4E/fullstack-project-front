'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useEventStore } from '@/store/event-store';
import { useTicketStore } from '@/store/ticket-store';
import { ticketsApi } from '@/lib/api';
import { NavHeader } from '@/components/shared/nav-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket as TicketIcon, QrCode } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Ticket as TicketType } from '@/types';

export default function OrganizerTicketsPage() {
  const { user } = useAuthStore();
  const { setEvents, getEventsByOrganizer } = useEventStore();
  const { setTickets } = useTicketStore();
  const [organizerEvents, setOrganizerEventsState] = useState<ReturnType<typeof getEventsByOrganizer>>([]);
  const [allTickets, setAllTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvents();
    setTickets();
  }, [setEvents, setTickets]);

  useEffect(() => {
    if (user) {
      const events = getEventsByOrganizer(user.id);
      setOrganizerEventsState(events);
      const tickets = events.flatMap((e) => ticketsApi.getByEvent(e.id));
      setAllTickets(tickets);
      setLoading(false);
    }
  }, [user, getEventsByOrganizer]);

  const statusConfig: Record<string, string> = {
    valid: 'bg-green-100 text-green-700',
    used: 'bg-muted text-muted-foreground',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-amber-100 text-amber-700',
  };

  return (
    <ProtectedRoute allowedRoles={['organizer']}>
      <div className="w-full min-h-screen">
        <NavHeader />

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold">Event Tickets</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {allTickets.length} ticket{allTickets.length !== 1 ? 's' : ''} sold across {organizerEvents.length} event{organizerEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : allTickets.length === 0 ? (
            <div className="rounded-xl border border-dashed p-14 text-center">
              <TicketIcon className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium mb-1">No tickets sold yet</p>
              <p className="text-sm text-muted-foreground">Tickets will appear here once purchased.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{ticket.eventTitle}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span>{ticket.userName}</span>
                      <span>·</span>
                      <span>{ticket.ticketType} ×{ticket.quantity}</span>
                      <span>·</span>
                      <span>฿{ticket.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <Badge className={`text-xs shrink-0 ${statusConfig[ticket.status]}`}>
                    {ticket.status}
                  </Badge>
                  <Link href={`/tickets/${ticket.id}`} className="shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
