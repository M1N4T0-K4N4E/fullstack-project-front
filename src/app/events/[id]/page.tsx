'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { useEventStore } from '@/store/event-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, User, Eye, ArrowLeft, Share2, Ticket, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedEvent, setSelectedEvent, isLoading } = useEventStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (params.id) {
      setSelectedEvent(params.id as string);
    }
  }, [params.id, setSelectedEvent]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Event not found</p>
        <Link href="/events">
          <Button variant="outline">Browse Events</Button>
        </Link>
      </div>
    );
  }

  const cheapestPrice = Math.min(...selectedEvent.ticketTypes.map((t) => t.price));
  const totalAvailable = selectedEvent.ticketTypes.reduce((sum, t) => sum + t.available, 0);
  const isPastEvent = new Date(selectedEvent.endDate) < new Date();
  const isSoldOut = totalAvailable === 0;
  const isCancelled = selectedEvent.status === 'cancelled';

  return (
    <div className="w-full min-h-screen">
      {/* Back nav */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to events
        </Link>
      </div>

      {/* Banner */}
      <div className="relative mt-4">
        <div className="h-56 md:h-80 lg:h-96 overflow-hidden">
          <img
            src={selectedEvent.banner}
            alt={selectedEvent.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        {/* Overlaid info on banner */}
        <div className="absolute bottom-0 left-0 right-0 px-4 md:px-8 pb-6 md:pb-8">
          <div className="container mx-auto">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">{selectedEvent.category}</Badge>
              {selectedEvent.featured && <Badge className="bg-amber-500">Featured</Badge>}
              {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
              {isPastEvent && <Badge variant="outline">Ended</Badge>}
            </div>
            <h1 className="font-heading text-2xl md:text-4xl font-bold text-white tracking-tight">
              {selectedEvent.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <section>
              <h2 className="font-heading text-lg font-semibold mb-3">About</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {selectedEvent.description}
              </p>
            </section>

            <Separator />

            {/* Details grid */}
            <section>
              <h2 className="font-heading text-lg font-semibold mb-4">Details</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedEvent.startDate), 'EEE, MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedEvent.startDate), 'h:mm a')} –{' '}
                      {format(new Date(selectedEvent.endDate), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.venue}</p>
                    <p className="text-sm text-muted-foreground/70">{selectedEvent.address}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Organizer</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.organizerName}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Views</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.views.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Ticket types */}
            <section>
              <h2 className="font-heading text-lg font-semibold mb-4">Ticket Types</h2>
              <div className="space-y-3">
                {selectedEvent.ticketTypes.map((tt) => (
                  <div
                    key={tt.id}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium text-sm">{tt.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-lg font-bold">฿{tt.price.toLocaleString()}</p>
                          {tt.isEarlyBird && (
                            <Badge variant="default" className="text-xs bg-green-500">Early Bird</Badge>
                          )}
                          {tt.available === 0 && (
                            <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{tt.available} / {tt.quantity}</p>
                      <p className="text-xs text-muted-foreground">available</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar card */}
          <div>
            <div className="sticky top-6 rounded-xl border bg-card p-6 space-y-5">
              <div>
                <p className="text-sm text-muted-foreground">Starting from</p>
                <p className="font-heading text-3xl font-bold">฿{cheapestPrice.toLocaleString()}</p>
              </div>

              {isSoldOut ? (
                <div className="text-center py-3">
                  <p className="text-destructive font-medium">Sold Out</p>
                  <p className="text-sm text-muted-foreground mt-1">All tickets have been claimed</p>
                </div>
              ) : isPastEvent ? (
                <div className="text-center py-3">
                  <p className="text-muted-foreground font-medium">Event Has Ended</p>
                </div>
              ) : isCancelled ? (
                <div className="text-center py-3">
                  <p className="text-destructive font-medium">Event Cancelled</p>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full gap-2"
                  onClick={() =>
                    user
                      ? router.push(`/events/${selectedEvent.id}/buy`)
                      : router.push(`/login?callbackUrl=/events/${selectedEvent.id}`)
                  }
                >
                  <Ticket className="h-4 w-4" />
                  {user ? 'Buy Tickets' : 'Login to Buy'}
                </Button>
              )}

              <Separator />

              <Button variant="outline" size="sm" className="w-full gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Share Event
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                {totalAvailable > 0 ? `${totalAvailable} tickets remaining` : 'Check back for updates'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
