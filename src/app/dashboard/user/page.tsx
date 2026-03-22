'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';
import { useTicketStore } from '@/store/ticket-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { TicketIcon, Calendar, MapPin, ArrowRight, QrCode } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  const { getTicketsByUser, setTickets, isLoading } = useTicketStore();
  const [tickets, setTicketsState] = useState<ReturnType<typeof getTicketsByUser>>([]);

  useEffect(() => {
    setTickets();
  }, [setTickets]);

  useEffect(() => {
    if (user) {
      setTicketsState(getTicketsByUser(user.id));
    }
  }, [user, getTicketsByUser]);

  const upcomingTickets = tickets.filter(
    (t) => t.status === 'valid' && new Date(t.eventDate) > new Date()
  );
  const pastTickets = tickets.filter(
    (t) => t.status !== 'valid' || new Date(t.eventDate) <= new Date()
  );

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tickets
              </CardTitle>
              <TicketIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tickets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Events
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingTickets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ฿{tickets.reduce((sum, t) => sum + t.price, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-8">
          <Link href="/events">
            <Button>
              Browse Events
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Upcoming Tickets */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : upcomingTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TicketIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming events</p>
                <Link href="/events">
                  <Button variant="link" className="mt-2">Browse events</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <img
                        src={`/api/tickets/${ticket.id}/qr`}
                        alt="QR"
                        className="w-16 h-16 rounded-lg border"
                      />
                    </div>
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
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="default">{ticket.ticketType}</Badge>
                      <Link href={`/tickets/${ticket.id}`}>
                        <Button size="sm" variant="outline">
                          <QrCode className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Tickets */}
        {pastTickets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Past Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pastTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="flex items-center gap-4 p-4 border rounded-lg opacity-75">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{ticket.eventTitle}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(ticket.eventDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <Badge
                      variant={
                        ticket.status === 'valid'
                          ? 'secondary'
                          : ticket.status === 'used'
                          ? 'outline'
                          : 'destructive'
                      }
                    >
                      {ticket.status}
                    </Badge>
                    <Link href={`/tickets/${ticket.id}`}>
                      <Button size="sm" variant="ghost">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
