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
            <Card className="relative mx-auto w-full pt-0">
                <div className="absolute inset-0 z-30 aspect-video bg-black/5" />
                <img
                    src={event.banner}
                    alt={event.title}
                    className="relative z-20 aspect-video w-full object-cover"
                />
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
                <CardFooter className="px-4 flex flex-col items-center justify-center">
                    <div className="flex justify-between w-full">
                        <div className="flex items-center gap-1">
                            <Ticket className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                                From <span className="font-semibold text-foreground">฿{cheapestPrice.toLocaleString()}</span>
                            </span>
                        </div>
                        <Badge variant={totalAvailable > 0 ? 'default' : 'destructive'}>
                            {totalAvailable > 0 ? `${totalAvailable} left` : 'Sold out'}
                        </Badge>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}
