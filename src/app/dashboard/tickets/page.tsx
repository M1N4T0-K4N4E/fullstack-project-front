'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useTicketStore } from '@/store/ticket-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketIcon, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Ticket } from '@/types';
import { format } from 'date-fns';

export default function UserTicketsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { getTicketsByUser, setTickets, isLoading } = useTicketStore();
  const [tickets, setTicketsState] = useState<Ticket[]>([]);

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

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Tickets</h1>
          <p className="text-muted-foreground">View and manage your purchased tickets</p>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tickets yet</p>
                <Link href="/events">
                  <Button variant="link" className="mt-2">
                    Browse events
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{ticket.eventTitle}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(ticket.eventDate), 'MMM d, yyyy • h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{ticket.venue}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{ticket.ticketType}</p>
                      <p className="text-sm text-muted-foreground">x{ticket.quantity}</p>
                    </div>
                    <Link href={`/tickets/${ticket.id}`}>
                      <Button size="sm">
                        View Ticket
                        <ArrowRight className="w-4 h-4 ml-1" />
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
