import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { ticketsApi } from '@/lib/api';
import QRCode from 'qrcode';
import { format } from 'date-fns';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = ticketsApi.getById(id);

  if (!ticket) {
    return new Response('Ticket not found', { status: 404 });
  }

  const qrDataUrl = await QRCode.toDataURL(ticket.qrCode || ticket.id, {
    width: 200,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' },
  });

  const eventDate = new Date(ticket.eventDate);
  const dateStr = format(eventDate, 'EEEE, MMM d, yyyy');
  const timeStr = format(eventDate, 'h:mm a');

  const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
    valid: { label: 'Valid', bg: '#dcfce7', color: '#15803d' },
    used: { label: 'Used', bg: '#f3f4f6', color: '#6b7280' },
    cancelled: { label: 'Cancelled', bg: '#fee2e2', color: '#b91c1c' },
    refunded: { label: 'Refunded', bg: '#fef3c7', color: '#b45309' },
  };
  const status = statusConfig[ticket.status] ?? { label: ticket.status, bg: '#f3f4f6', color: '#6b7280' };

  return new ImageResponse(
    (
      <div
        style={{
          width: '400px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header strip - bg-primary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#2346dd',
            padding: '12px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white' }}>
            {/* Ticket icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2" />
              <path d="M13 17v2" />
              <path d="M13 11v2" />
            </svg>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>Your Ticket</span>
          </div>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: status.bg,
              color: status.color,
            }}
          >
            {status.label}
          </span>
        </div>

        {/* Content - p-6 space-y-4 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            gap: '16px',
          }}
        >
          {/* Event Title */}
          <div style={{ display: 'flex' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', lineHeight: 1.25 }}>
              {ticket.eventTitle}
            </span>
          </div>

          {/* Date & Venue */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {/* Calendar icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}>
                <path d="M8 2v4" />
                <path d="M16 2v4" />
                <rect width="18" height="18" x="3" y="4" rx="2" />
                <path d="M3 10h18" />
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{dateStr}</span>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>{timeStr}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              {/* MapPin icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px', flexShrink: 0 }}>
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span style={{ fontSize: '14px', color: '#111827' }}>{ticket.venue}</span>
            </div>
          </div>

          {/* Separator */}
          <div style={{ display: 'flex', width: '100%', height: '1px', backgroundColor: '#e5e7eb' }} />

          {/* Ticket details - grid cols-3 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Type</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{ticket.ticketType}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Qty</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>×{ticket.quantity}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <span style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Total</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>฿{ticket.price.toLocaleString()}</span>
            </div>
          </div>

          {/* Separator */}
          <div style={{ display: 'flex', width: '100%', height: '1px', backgroundColor: '#e5e7eb' }} />

          {/* QR Code */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
            <img
              src={qrDataUrl}
              width={192}
              height={192}
              style={{ borderRadius: '8px', border: '2px solid #e5e7eb' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Ticket ID</span>
              <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', letterSpacing: '3px', fontFamily: 'monospace' }}>
                {ticket.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 400,
      height: 620,
    }
  );
}
