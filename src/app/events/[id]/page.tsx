'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { useEventStore } from '@/store/event-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, MapPin, User, Eye, ArrowLeft, Share2, Ticket } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-64 w-full rounded-lg mb-6" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    );
  }

  if (!selectedEvent) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Link href="/events">
          <Button variant="outline">Back to Events</Button>
        </Link>
      </div>
    );
  }

  const cheapestPrice = Math.min(...selectedEvent.ticketTypes.map((t) => t.price));
  const totalAvailable = selectedEvent.ticketTypes.reduce((sum, t) => sum + t.available, 0);
  const isPastEvent = new Date(selectedEvent.endDate) < new Date();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/events" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>

      {/* Banner */}
      <div className="relative h-64 md:h-96 rounded-xl overflow-hidden mb-8">
        <img
          src={selectedEvent.banner}
          alt={selectedEvent.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Badge>{selectedEvent.category}</Badge>
            {selectedEvent.featured && <Badge className="bg-amber-500">Featured</Badge>}
            {selectedEvent.status === 'cancelled' && <Badge variant="destructive">Cancelled</Badge>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{selectedEvent.title}</h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About This Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground whitespace-pre-wrap">{selectedEvent.description}</p>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedEvent.startDate), 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(selectedEvent.startDate), 'h:mm a')} - {format(new Date(selectedEvent.endDate), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Venue</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.venue}</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.organizerName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Eye className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Views</p>
                    <p className="text-sm text-muted-foreground">{selectedEvent.views.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Types */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedEvent.ticketTypes.map((ticketType) => (
                <div
                  key={ticketType.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{ticketType.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>฿{ticketType.price.toLocaleString()}</span>
                      {ticketType.isEarlyBird && (
                        <Badge variant="default" className="text-xs bg-green-500">Early Bird</Badge>
                      )}
                      {ticketType.available === 0 && (
                        <Badge variant="destructive" className="text-xs">Sold Out</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">{ticketType.available} available</p>
                    <p className="text-sm">of {ticketType.quantity}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Get Tickets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">฿{cheapestPrice.toLocaleString()}</span>
                <span className="text-muted-foreground">starting from</span>
              </div>

              <div className="text-sm text-muted-foreground">
                {totalAvailable > 0 ? (
                  <span>{totalAvailable} tickets remaining</span>
                ) : (
                  <span className="text-destructive">Sold out</span>
                )}
              </div>

              {user ? (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={isPastEvent || selectedEvent.status === 'cancelled' || totalAvailable === 0}
                  onClick={() => router.push(`/events/${selectedEvent.id}/buy`)}
                >
                  <Ticket className="w-4 h-4 mr-2" />
                  {isPastEvent ? 'Event Ended' : 'Buy Tickets'}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => router.push(`/login?callbackUrl=/events/${selectedEvent.id}`)}
                >
                  Login to Buy Tickets
                </Button>
              )}

              <Button variant="outline" className="w-full" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share Event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
