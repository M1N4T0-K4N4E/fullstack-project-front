'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { z } from 'zod';
import { toFormikValidationSchema } from '@/lib/utils';
import { useEventStore } from '@/store/event-store';
import { useTicketStore } from '@/store/ticket-store';
import { useAuthStore } from '@/store/auth-store';
import { ticketsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Minus, Plus, Ticket, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';

const buySchema = z.object({
  ticketTypeId: z.string().min(1, 'Please select a ticket type'),
  quantity: z.number().min(1, 'At least 1 ticket').max(10, 'Maximum 10 tickets'),
});

type BuyFormValues = z.infer<typeof buySchema>;

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
      <div className="container mx-auto py-8 px-4">
        <p>Loading...</p>
      </div>
    );
  }

  const ticketType = selectedEvent.ticketTypes.find((tt) => tt.id === selectedTicketType);
  const subtotal = ticketType ? ticketType.price * 1 : 0;
  const fees = subtotal * 0.05;
  const total = subtotal + fees;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href={`/events/${selectedEvent.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Event
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left - Event Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{selectedEvent.title}</h1>
            <div className="text-muted-foreground">
              <p>{format(new Date(selectedEvent.startDate), 'EEEE, MMMM d, yyyy • h:mm a')}</p>
              <p>{selectedEvent.venue}</p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Ticket Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedEvent.ticketTypes.map((tt) => (
                <div
                  key={tt.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTicketType === tt.id
                      ? 'border-primary bg-primary/5'
                      : tt.available === 0
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => tt.available > 0 && setSelectedTicketType(tt.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tt.name}</span>
                        {tt.isEarlyBird && <Badge className="text-xs bg-green-500">Early Bird</Badge>}
                        {tt.available === 0 && <Badge variant="destructive" className="text-xs">Sold Out</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">฿{tt.price.toLocaleString()} per ticket</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>{tt.available} left</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right - Order Summary */}
        <div>
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTicketType ? (
                <Formik
                  initialValues={{ ticketTypeId: selectedTicketType, quantity: 1 }}
                  validationSchema={toFormikValidationSchema(buySchema)}
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
                  {({ values, setFieldValue, errors }) => (
                    <Form className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">
                          {selectedEvent.ticketTypes.find((tt) => tt.id === values.ticketTypeId)?.name}
                        </span>
                        <span className="text-muted-foreground">x {values.quantity}</span>
                      </div>

                      <div className="flex items-center justify-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={values.quantity <= 1}
                          onClick={() => setFieldValue('quantity', values.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-xl font-semibold w-12 text-center">{values.quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          disabled={
                            values.quantity >= 10 ||
                            values.quantity >= (selectedEvent.ticketTypes.find((tt) => tt.id === values.ticketTypeId)?.available || 0)
                          }
                          onClick={() => setFieldValue('quantity', values.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <Separator />

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span>฿{(ticketType!.price * values.quantity).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Service Fee (5%)</span>
                          <span>฿{Math.round(ticketType!.price * values.quantity * 0.05).toLocaleString()}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total</span>
                          <span>
                            ฿
                            {Math.round(ticketType!.price * values.quantity * 1.05).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Button type="submit" className="w-full" size="lg">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Complete Purchase
                      </Button>
                    </Form>
                  )}
                </Formik>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Select a ticket type to continue</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
