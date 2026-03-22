'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';
import { useTicketStore } from '@/store/ticket-store';
import { NavHeader } from '@/components/shared/nav-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Ticket, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Ticket as TicketType } from '@/types';

export default function UserTicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { getTicketsByUser, setTickets, isLoading } = useTicketStore();
  const [tickets, setTicketsState] = useState<TicketType[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    setTickets();
  }, [setTickets]);

  useEffect(() => {
    if (user) {
      setTicketsState(getTicketsByUser(user.id));
    }
  }, [user, getTicketsByUser]);

  if (!isAuthenticated) {
    return null;
  }

  const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    valid: { variant: 'default' },
    used: { variant: 'outline' },
    cancelled: { variant: 'destructive' },
    refunded: { variant: 'secondary' },
  };

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="w-full min-h-screen">
        <NavHeader />

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold">My Tickets</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} in total
              </p>
            </div>
            <Link href="/events">
              <Button size="sm" className="gap-1.5">
                Browse Events
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : tickets.length === 0 ? (
            <div className="rounded-xl border border-dashed p-14 text-center">
              <Ticket className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="font-medium mb-1">No tickets yet</p>
              <p className="text-sm text-muted-foreground mb-4">Browse events to get started.</p>
              <Link href="/events">
                <Button variant="outline" size="sm">Browse Events</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{ticket.eventTitle}</p>
                      <Badge
                        variant={statusConfig[ticket.status]?.variant ?? 'secondary'}
                        className="text-xs shrink-0"
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>{format(new Date(ticket.eventDate), 'MMM d, yyyy · h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{ticket.venue}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-sm font-medium">{ticket.ticketType}</p>
                    <p className="text-xs text-muted-foreground">×{ticket.quantity}</p>
                  </div>
                  <Link href={`/tickets/${ticket.id}`} className="shrink-0">
                    <Button size="sm" className="gap-1">
                      View
                      <ArrowRight className="h-3 w-3" />
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
