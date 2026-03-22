'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { eventsApi } from '@/lib/api';
import { NavHeader } from '@/components/shared/nav-header';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar, MapPin, Eye } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Event } from '@/types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvents(eventsApi.getAll());
    setLoading(false);
  }, []);

  const filteredEvents = events.filter(
    (e) =>
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organizerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColor: Record<string, string> = {
    published: 'bg-green-100 text-green-700',
    draft: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="w-full min-h-screen">
        <NavHeader />

        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl font-bold">Event Management</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events or organizers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed p-14 text-center">
              <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-muted-foreground text-sm">No events found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const sold = event.ticketTypes.reduce((s, tt) => s + (tt.quantity - tt.available), 0);
                const total = event.ticketTypes.reduce((s, tt) => s + tt.quantity, 0);
                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-4 p-4 rounded-xl border bg-card"
                  >
                    <img
                      src={event.banner}
                      alt={event.title}
                      className="w-16 h-16 rounded-lg object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold truncate">{event.title}</p>
                        <Badge className={`text-xs shrink-0 ${statusColor[event.status]}`}>
                          {event.status}
                        </Badge>
                        {event.featured && (
                          <Badge variant="outline" className="text-xs shrink-0">Featured</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>By {event.organizerName}</span>
                        <span>{sold}/{total} sold</span>
                        <span>{event.views} views</span>
                      </div>
                    </div>
                    <Link href={`/events/${event.id}`} className="shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
