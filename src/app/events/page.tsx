'use client';

import { useEffect } from 'react';
import { useEventStore } from '@/store/event-store';
import { EventCard } from '@/components/events/event-card';
import { EventFilters } from '@/components/events/event-filters';
import { NavHeader } from '@/components/shared/nav-header';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty } from '@/components/ui/empty';
import { Search } from 'lucide-react';

export default function EventsPage() {
  const { setEvents, getFilteredEvents, isLoading } = useEventStore();

  useEffect(() => {
    setEvents();
  }, [setEvents]);

  const filteredEvents = getFilteredEvents();

  return (
    <div className="w-full min-h-screen">
      <NavHeader />

      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">Browse Events</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} available
              </p>
            </div>
          </div>

          <div className="mt-4">
            <EventFilters />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <Empty className="py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="font-medium">No events found</p>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                Try adjusting your filters or check back later for new events.
              </p>
              <Button variant="outline" size="sm" onClick={() => setEvents()}>
                Clear filters
              </Button>
            </div>
          </Empty>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
