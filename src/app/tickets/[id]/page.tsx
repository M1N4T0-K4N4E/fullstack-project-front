'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { useTicketStore } from '@/store/ticket-store';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Share2, Calendar, MapPin, Ticket as TicketIcon, QrCode } from 'lucide-react';
import { toast } from 'sonner';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getTicketById, isLoading } = useTicketStore();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<ReturnType<typeof getTicketById>>(undefined);

  useEffect(() => {
    if (params.id) {
      const t = getTicketById(params.id as string);
      setTicket(t);
    }
  }, [params.id, getTicketById]);

  if (!user) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Skeleton className="h-96 w-full max-w-md mx-auto rounded-xl" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Ticket not found</h1>
        <Link href="/dashboard/tickets">
          <Button variant="outline">Back to My Tickets</Button>
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'used':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Link href="/dashboard/tickets" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to My Tickets
      </Link>

      <div className="max-w-md mx-auto space-y-6">
        {/* Ticket Card with QR */}
        <Card className="overflow-hidden">
          <div className="bg-primary p-4 text-primary-foreground">
            <div className="flex items-center gap-2">
              <TicketIcon className="w-5 h-5" />
              <span className="font-semibold">Your Ticket</span>
            </div>
          </div>

          <CardContent className="p-6">
            {/* QR Code Image */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={`/api/tickets/${ticket.id}/qr`}
                  alt="Ticket QR Code"
                  className="w-64 h-64 rounded-lg border-2 border-gray-200"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-primary/20" />
                </div>
              </div>
            </div>

            {/* Ticket ID */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground">Ticket ID</p>
              <p className="text-lg font-mono font-bold">{ticket.id.slice(0, 8).toUpperCase()}</p>
            </div>

            <Separator className="my-4" />

            {/* Event Info */}
            <div className="space-y-3">
              <div>
                <p className="text-xl font-bold">{ticket.eventTitle}</p>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">
                    {format(new Date(ticket.eventDate), 'EEEE, MMMM d, yyyy')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(ticket.eventDate), 'h:mm a')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <p className="text-sm">{ticket.venue}</p>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Ticket Type</p>
                  <p className="font-semibold">{ticket.ticketType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-semibold">x{ticket.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-semibold">฿{ticket.price.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge className={`px-4 py-2 text-sm ${getStatusColor(ticket.status)}`}>
            Status: {ticket.status.toUpperCase()}
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {/* Purchase Info */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Purchase Details</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
            <p>Purchased on {format(new Date(ticket.purchasedAt), 'MMMM d, yyyy at h:mm a')}</p>
            <p>Purchased by {ticket.userName}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
