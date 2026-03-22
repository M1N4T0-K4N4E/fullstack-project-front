'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EventForm } from '@/components/forms/event-form';
import { NavHeader } from '@/components/shared/nav-header';
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function CreateEventPage() {
  return (
    <ProtectedRoute allowedRoles={['organizer']}>
      <div className="w-full min-h-screen">
        <NavHeader />
        <div className="container mx-auto py-8 px-4">
          <Link
            href="/dashboard/organizer/events"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Events
          </Link>

          <div className="mb-8">
            <h1 className="font-heading text-3xl font-bold mb-2">Create Event</h1>
            <p className="text-muted-foreground">Fill in the details to create a new event</p>
          </div>

          <EventForm />
        </div>
      </div>
    </ProtectedRoute>
  );
}
