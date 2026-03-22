'use client';

import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { eventsApi } from '@/lib/api';
import { Event } from '@/types';

const categories = ['Concert', 'Workshop', 'Seminar', 'Sports', 'Festival', 'Other'];

const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Please select a category'),
  banner: z.string().url('Please enter a valid URL').or(z.literal('')),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  venue: z.string().min(2, 'Venue is required'),
  address: z.string().min(5, 'Address is required'),
  status: z.enum(['draft', 'published', 'cancelled']),
  featured: z.boolean(),
  ticketTypes: z.array(
    z.object({
      name: z.string().min(1, 'Ticket type name is required'),
      price: z.number().min(0, 'Price must be positive'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
      isEarlyBird: z.boolean().optional(),
      earlyBirdEndDate: z.string().optional(),
    })
  ).min(1, 'At least one ticket type is required'),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  const initialValues: EventFormValues = event
    ? {
        title: event.title,
        description: event.description,
        category: event.category,
        banner: event.banner,
        startDate: event.startDate.slice(0, 16),
        endDate: event.endDate.slice(0, 16),
        venue: event.venue,
        address: event.address,
        status: event.status,
        featured: event.featured,
        ticketTypes: event.ticketTypes.map((tt) => ({
          name: tt.name,
          price: tt.price,
          quantity: tt.quantity,
          isEarlyBird: tt.isEarlyBird,
          earlyBirdEndDate: tt.earlyBirdEndDate || '',
        })),
      }
    : {
        title: '',
        description: '',
        category: '',
        banner: '',
        startDate: '',
        endDate: '',
        venue: '',
        address: '',
        status: 'draft',
        featured: false,
        ticketTypes: [{ name: 'Regular', price: 0, quantity: 100, isEarlyBird: false }],
      };

  const handleSubmit = (values: EventFormValues, { setSubmitting }: { setSubmitting: (v: boolean) => void }) => {
    if (!user) return;

    const eventData = {
      ...values,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      banner: values.banner || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      organizerId: user.id,
      organizerName: user.name,
      ticketTypes: values.ticketTypes.map((tt, i) => ({
        id: event?.ticketTypes[i]?.id || `tt-new-${i}`,
        name: tt.name,
        price: tt.price,
        quantity: tt.quantity,
        available: event?.ticketTypes[i]?.available ?? tt.quantity,
        isEarlyBird: tt.isEarlyBird,
        earlyBirdEndDate: tt.earlyBirdEndDate,
      })),
    };

    if (event) {
      eventsApi.update(event.id, eventData);
      toast.success('Event updated successfully!');
    } else {
      eventsApi.create(eventData);
      toast.success('Event created successfully!');
    }

    setSubmitting(false);
    router.push('/dashboard/organizer/events');
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={async (values) => {
        const result = await eventSchema.safeParseAsync(values);
        if (!result.success) {
          const errors: Record<string, string> = {};
          for (const issue of result.error.issues) {
            const path = issue.path.join('.');
            if (!errors[path]) errors[path] = issue.message;
          }
          return errors;
        }
        return {};
      }}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue, isSubmitting }) => (
        <Form className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Field as={Input} id="title" name="title" placeholder="Enter event title" />
                <ErrorMessage name="title" component="p" className="text-sm text-red-500" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Field as={Textarea} id="description" name="description" placeholder="Describe your event..." rows={4} />
                <ErrorMessage name="description" component="p" className="text-sm text-red-500" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Field name="category">
                    {() => (
                      <Select value={values.category} onValueChange={(v) => setFieldValue('category', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </Field>
                  <ErrorMessage name="category" component="p" className="text-sm text-red-500" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="banner">Banner Image URL</Label>
                  <Field as={Input} id="banner" name="banner" placeholder="https://..." />
                  <ErrorMessage name="banner" component="p" className="text-sm text-red-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date & Venue */}
          <Card>
            <CardHeader>
              <CardTitle>Date & Venue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date & Time</Label>
                  <Field as={Input} id="startDate" name="startDate" type="datetime-local" />
                  <ErrorMessage name="startDate" component="p" className="text-sm text-red-500" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date & Time</Label>
                  <Field as={Input} id="endDate" name="endDate" type="datetime-local" />
                  <ErrorMessage name="endDate" component="p" className="text-sm text-red-500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue Name</Label>
                <Field as={Input} id="venue" name="venue" placeholder="e.g., Central Park Amphitheater" />
                <ErrorMessage name="venue" component="p" className="text-sm text-red-500" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Field as={Input} id="address" name="address" placeholder="Full address" />
                <ErrorMessage name="address" component="p" className="text-sm text-red-500" />
              </div>
            </CardContent>
          </Card>

          {/* Ticket Types */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Types</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldArray name="ticketTypes">
                {({ remove, push }) => (
                  <div className="space-y-4">
                    {values.ticketTypes.map((ticketType, index) => (
                      <div key={index} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Ticket Type {index + 1}</Badge>
                          {values.ticketTypes.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>

                        <div className="grid gap-4 md:grid-cols-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Field as={Input} name={`ticketTypes.${index}.name`} placeholder="e.g., VIP" />
                          </div>
                          <div className="space-y-2">
                            <Label>Price (฿)</Label>
                            <Field as={Input} name={`ticketTypes.${index}.price`} type="number" min="0" />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Field as={Input} name={`ticketTypes.${index}.quantity`} type="number" min="1" />
                          </div>
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              <Field
                                type="checkbox"
                                name={`ticketTypes.${index}.isEarlyBird`}
                                className="rounded"
                              />
                              Early Bird
                            </Label>
                          </div>
                        </div>

                        {values.ticketTypes[index].isEarlyBird && (
                          <div className="space-y-2">
                            <Label>Early Bird End Date</Label>
                            <Field as={Input} name={`ticketTypes.${index}.earlyBirdEndDate`} type="date" />
                          </div>
                        )}
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => push({ name: '', price: 0, quantity: 1, isEarlyBird: false })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Ticket Type
                    </Button>
                  </div>
                )}
              </FieldArray>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Field name="status">
                  {() => (
                    <Select value={values.status} onValueChange={(v) => setFieldValue('status', v as 'draft' | 'published')}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <span className="text-sm text-muted-foreground">Event Status</span>
              </div>

              <div className="flex items-center gap-4">
                <Field name="featured" type="checkbox" />
                <Label>Feature this event</Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
