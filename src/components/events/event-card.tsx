'use client';

import Link from 'next/link';
import { format } from 'date-fns';
import { Event } from '@/types';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Ticket } from 'lucide-react';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const cheapestPrice = Math.min(...event.ticketTypes.map((t) => t.price));
  const totalAvailable = event.ticketTypes.reduce((sum, t) => sum + t.available, 0);

  return (
    <Link href={`/events/${event.id}`}>
      <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={event.banner}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <Badge variant="secondary" className="text-xs">
              {event.category}
            </Badge>
            {event.featured && <Badge className="bg-amber-500">Featured</Badge>}
          </div>
          <h3 className="font-semibold text-lg line-clamp-1 mt-2">{event.title}</h3>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(event.startDate), 'MMM d, yyyy • h:mm a')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Ticket className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">
              From <span className="font-semibold text-foreground">฿{cheapestPrice.toLocaleString()}</span>
            </span>
          </div>
          <Badge variant={totalAvailable > 0 ? 'default' : 'destructive'}>
            {totalAvailable > 0 ? `${totalAvailable} left` : 'Sold out'}
          </Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}
