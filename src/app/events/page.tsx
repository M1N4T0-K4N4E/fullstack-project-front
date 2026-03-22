'use client';

import { useEffect } from 'react';
import { useEventStore } from '@/store/event-store';
import { EventCard } from '@/components/events/event-card';
import { EventFilters } from '@/components/events/event-filters';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

export default function EventsPage() {
    const { events, setEvents, getFilteredEvents, isLoading } = useEventStore();

    useEffect(() => {
        setEvents();
    }, [setEvents]);

    const filteredEvents = getFilteredEvents();

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Browse Events</h1>
                <p className="text-muted-foreground">Find and book tickets for upcoming events</p>
            </div>

            <div className="mb-6">
                <EventFilters />
            </div>

            {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <Skeleton className="h-48 w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <Empty>
                    <EmptyTitle>No events found</EmptyTitle>
                    <EmptyDescription>Try adjusting your filters or check back later for new events.</EmptyDescription>
                </Empty>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
}
