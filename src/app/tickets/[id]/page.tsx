'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { useTicketStore } from '@/store/ticket-store';
import { useAuthStore } from '@/store/auth-store';
import { NavHeader } from '@/components/shared/nav-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, Share2, Calendar, MapPin, Ticket, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Ticket as TicketType } from '@/types';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getTicketById, isLoading } = useTicketStore();
  const { user } = useAuthStore();
  const [ticket, setTicket] = useState<TicketType | undefined>(undefined);

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
      <div className="w-full min-h-screen">
        <NavHeader />
        <div className="container mx-auto px-4 py-20">
          <Skeleton className="h-96 w-full max-w-md mx-auto rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="w-full min-h-screen">
        <NavHeader />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground mb-4">Ticket not found</p>
          <Link href="/dashboard/tickets">
            <Button variant="outline">Back to Tickets</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    valid: { label: 'Valid', className: 'bg-green-100 text-green-700' },
    used: { label: 'Used', className: 'bg-muted text-muted-foreground' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
    refunded: { label: 'Refunded', className: 'bg-amber-100 text-amber-700' },
  };

  const status = statusConfig[ticket.status] ?? { label: ticket.status, className: 'bg-muted' };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="w-full min-h-screen">
      <NavHeader />

      <div className="container mx-auto px-4 py-6">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to my tickets
        </Link>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-md space-y-6">
          {/* Ticket card */}
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            {/* Header strip */}
            <div className="bg-primary px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-foreground">
                <Ticket className="h-4 w-4" />
                <span className="font-semibold text-sm">Your Ticket</span>
              </div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
                {status.label}
              </span>
            </div>

            {/* Event info */}
            <div className="p-6 space-y-4">
              <div>
                <h1 className="font-heading text-xl font-bold leading-tight">
                  {ticket.eventTitle}
                </h1>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">
                      {format(new Date(ticket.eventDate), 'EEEE, MMM d, yyyy')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(ticket.eventDate), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-sm">{ticket.venue}</p>
                </div>
              </div>

              <Separator />

              {/* Ticket details */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <p className="font-semibold text-sm">{ticket.ticketType}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Qty</p>
                  <p className="font-semibold text-sm">×{ticket.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total</p>
                  <p className="font-semibold text-sm">฿{ticket.price.toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3 py-2">
                <img
                  src={`/api/tickets/${ticket.id}/qr`}
                  alt="Ticket QR Code"
                  className="w-48 h-48 rounded-lg border-2 border-border"
                />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Ticket ID</p>
                  <p className="font-mono font-bold text-base tracking-widest">
                    {ticket.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={async () => {
                const res = await fetch(`/api/tickets/${ticket.id}/image`);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ticket-${ticket.id.slice(0, 8).toUpperCase()}.png`;
                a.click();
                URL.revokeObjectURL(url);
                toast.success('Ticket image downloaded!');
              }}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>

          {/* Purchase details */}
          <div className="rounded-xl border bg-card p-4 space-y-1.5">
            <h3 className="text-sm font-semibold mb-2">Purchase Details</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Purchased</span>
              <span>{format(new Date(ticket.purchasedAt), 'MMM d, yyyy · h:mm a')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Purchased by</span>
              <span>{ticket.userName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
