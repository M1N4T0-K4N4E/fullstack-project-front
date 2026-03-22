'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { useEventStore } from '@/store/event-store';
import { useTicketStore } from '@/store/ticket-store';
import { useAuthStore } from '@/store/auth-store';
import { ticketsApi } from '@/lib/api';
import { NavHeader } from '@/components/shared/nav-header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Minus, Plus, Ticket, CreditCard, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

const buySchema = z.object({
  ticketTypeId: z.string().min(1, 'Please select a ticket type'),
  quantity: z.number().min(1, 'At least 1 ticket').max(10, 'Maximum 10 tickets'),
});

export default function BuyTicketPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedEvent, setSelectedEvent, isLoading } = useEventStore();
  const { purchaseTicket } = useTicketStore();
  const { user } = useAuthStore();
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      setSelectedEvent(params.id as string);
    }
  }, [params.id, setSelectedEvent]);

  if (!user) {
    router.push(`/login?callbackUrl=/events/${params.id}/buy`);
    return null;
  }

  if (isLoading || !selectedEvent) {
    return (
      <div className="w-full min-h-screen">
        <NavHeader />
        <div className="container mx-auto px-4 py-20">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const ticketType = selectedEvent.ticketTypes.find((tt) => tt.id === selectedTicketType);

  return (
    <div className="w-full min-h-screen">
      <NavHeader />

      <div className="container mx-auto px-4 py-6">
        <Link
          href={`/events/${selectedEvent.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to event
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-12">
        <div className="mb-8">
          <h1 className="font-heading text-2xl font-bold">Get Tickets</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedEvent.title} · {format(new Date(selectedEvent.startDate), 'MMM d, yyyy')}
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Ticket selection */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Select Ticket Type</h2>
            {selectedEvent.ticketTypes.map((tt) => (
              <button
                key={tt.id}
                onClick={() => tt.available > 0 && setSelectedTicketType(tt.id)}
                disabled={tt.available === 0}
                className={`
                  w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all
                  ${selectedTicketType === tt.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : tt.available === 0
                    ? 'opacity-40 cursor-not-allowed border-border bg-muted/20'
                    : 'border-border bg-card hover:border-primary/40 cursor-pointer'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {selectedTicketType === tt.id && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{tt.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-bold">฿{tt.price.toLocaleString()}</p>
                      {tt.isEarlyBird && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                          Early Bird
                        </span>
                      )}
                      {tt.available === 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                          Sold Out
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{tt.available} left</p>
                </div>
              </button>
            ))}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-2">
            <div className="sticky top-6 rounded-xl border bg-card p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <h2 className="font-semibold text-sm">Order Summary</h2>
              </div>

              {selectedTicketType ? (
                <Formik
                  initialValues={{ ticketTypeId: selectedTicketType, quantity: 1 }}
                  validate={async (values) => {
                    const result = await buySchema.safeParseAsync(values);
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
                  onSubmit={async (values, { setSubmitting }) => {
                    const ticket = ticketsApi.purchase(
                      { eventId: selectedEvent.id, ticketTypeId: values.ticketTypeId, quantity: values.quantity },
                      user.id,
                      user.name
                    );
                    if (ticket) {
                      toast.success('Ticket purchased successfully!');
                      router.push(`/tickets/${ticket.id}`);
                    } else {
                      toast.error('Failed to purchase ticket. Please try again.');
                    }
                    setSubmitting(false);
                  }}
                >
                  {({ values, setFieldValue }) => {
                    const sub = ticketType!.price * values.quantity;
                    const fee = Math.round(sub * 0.05);
                    const total = sub + fee;
                    return (
                      <Form className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{ticketType!.name}</p>
                            <p className="text-xs text-muted-foreground">฿{ticketType!.price.toLocaleString()} × {values.quantity}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-center gap-5 py-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={values.quantity <= 1}
                            onClick={() => setFieldValue('quantity', values.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-lg font-bold w-8 text-center">{values.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            disabled={
                              values.quantity >= 10 ||
                              values.quantity >= ticketType!.available
                            }
                            onClick={() => setFieldValue('quantity', values.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Separator />

                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>฿{sub.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Service fee (5%)</span>
                            <span>฿{fee.toLocaleString()}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span>฿{total.toLocaleString()}</span>
                          </div>
                        </div>

                        <Button type="submit" size="lg" className="w-full gap-2">
                          <CreditCard className="h-4 w-4" />
                          Complete Purchase
                        </Button>
                      </Form>
                    );
                  }}
                </Formik>
              ) : (
                <div className="text-center py-8">
                  <Ticket className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Select a ticket type above</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
