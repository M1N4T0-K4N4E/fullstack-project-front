'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEventStore } from '@/store/event-store';
import { EventForm } from '@/components/forms/event-form';
import { Skeleton } from '@/components/ui/skeleton';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ArrowLeft } from 'lucide-react';
import { Event } from '@/types';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { setEvents, events, getEventsByOrganizer } = useEventStore();
  const [event, setEvent] = useState<Event | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEvents();
  }, [setEvents]);

  useEffect(() => {
    const found = events.find((e) => e.id === params.id);
    if (found) {
      setEvent(found);
    }
    setLoading(false);
  }, [events, params.id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <Link href="/dashboard/organizer/events">
          <button className="px-4 py-2 bg-primary text-white rounded-lg">Back to Events</button>
        </Link>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['organizer']}>
      <div className="container mx-auto py-8 px-4">
        <Link href="/dashboard/organizer/events" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
          <p className="text-muted-foreground">Update your event details</p>
        </div>

        <EventForm event={event} />
      </div>
    </ProtectedRoute>
  );
}
