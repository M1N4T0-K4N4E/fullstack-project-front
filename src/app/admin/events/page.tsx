'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { eventsApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Calendar, MapPin, Eye, Edit, Trash2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Event } from '@/types';
import { Button } from '@/components/ui/button';

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Event Management</h1>
          <p className="text-muted-foreground">View and manage all events</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Events ({filteredEvents.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEvents.map((event) => {
                  const ticketsSold = event.ticketTypes.reduce(
                    (s, tt) => s + (tt.quantity - tt.available),
                    0
                  );
                  const totalCapacity = event.ticketTypes.reduce((s, tt) => s + tt.quantity, 0);
                  return (
                    <div key={event.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <img
                        src={event.banner}
                        alt={event.title}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold truncate">{event.title}</p>
                          <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                          {event.featured && <Badge variant="outline">Featured</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{format(new Date(event.startDate), 'MMM d, yyyy')}</span>
                          <MapPin className="w-3 h-3 ml-2" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span>By {event.organizerName}</span>
                          <span>{ticketsSold} / {totalCapacity} sold</span>
                          <span>{event.views} views</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
