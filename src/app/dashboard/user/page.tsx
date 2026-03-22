'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useAuthStore } from '@/store/auth-store';
import { useTicketStore } from '@/store/ticket-store';
import { NavHeader } from '@/components/shared/nav-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import {
  Ticket,
  Calendar,
  ArrowRight,
  QrCode,
  TrendingUp,
} from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Ticket as TicketType } from '@/types';

export default function UserDashboardPage() {
  const { user } = useAuthStore();
  const { getTicketsByUser, setTickets, isLoading } = useTicketStore();
  const [tickets, setTicketsState] = useState<TicketType[]>([]);

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

  const totalSpent = tickets.reduce((sum, t) => sum + t.price, 0);

  return (
    <ProtectedRoute allowedRoles={['user']}>
      <div className="w-full min-h-screen">
        <NavHeader />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-heading text-2xl font-bold">
                Welcome back, {user?.name?.split(' ')[0]}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Here&apos;s what&apos;s happening with your tickets.</p>
            </div>
            <Link href="/events">
              <Button size="sm" className="gap-1.5">
                Browse Events
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Ticket className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold font-heading">{tickets.length}</p>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                  <Calendar className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold font-heading">{upcomingTickets.length}</p>
              <p className="text-sm text-muted-foreground">Upcoming</p>
            </div>
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold font-heading">฿{totalSpent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </div>
          </div>

          {/* Upcoming tickets */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-semibold">Upcoming Events</h2>
              <Link href="/dashboard/tickets" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
              </div>
            ) : upcomingTickets.length === 0 ? (
              <div className="rounded-xl border border-dashed p-10 text-center">
                <Ticket className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-muted-foreground text-sm mb-3">No upcoming events</p>
                <Link href="/events">
                  <Button variant="outline" size="sm">Browse events</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-card"
                  >
                    <img
                      src={`/api/tickets/${ticket.id}/qr`}
                      alt="QR"
                      className="w-16 h-16 rounded-lg border shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{ticket.eventTitle}</p>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(ticket.eventDate), 'MMM d, yyyy · h:mm a')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <span className="truncate">{ticket.venue}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">{ticket.ticketType}</Badge>
                      <Link href={`/tickets/${ticket.id}`}>
                        <Button size="sm" variant="outline" className="gap-1">
                          <QrCode className="h-3 w-3" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past tickets */}
          {pastTickets.length > 0 && (
            <section>
              <h2 className="font-heading text-lg font-semibold mb-4">Past Events</h2>
              <div className="space-y-2">
                {pastTickets.slice(0, 5).map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center gap-4 p-3 rounded-xl border bg-card opacity-75"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ticket.eventTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ticket.eventDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge
                      variant={
                        ticket.status === 'valid'
                          ? 'secondary'
                          : ticket.status === 'used'
                          ? 'outline'
                          : 'destructive'
                      }
                      className="text-xs shrink-0"
                    >
                      {ticket.status}
                    </Badge>
                    <Link href={`/tickets/${ticket.id}`} className="shrink-0">
                      <Button size="sm" variant="ghost" className="text-xs">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
