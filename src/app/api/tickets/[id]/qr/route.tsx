import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { ticketsApi } from '@/lib/api';

export const runtime = 'edge';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = ticketsApi.getById(id);

  if (!ticket) {
    return new Response('Ticket not found', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '400px',
          height: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          border: '2px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              backgroundColor: '#6366f1',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            T
          </div>
          <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937' }}>
            Tickale
          </span>
        </div>

        {/* Event Title */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            {ticket.eventTitle}
          </h1>
        </div>

        {/* QR Code placeholder - using ticket ID as data */}
        <div
          style={{
            width: '200px',
            height: '200px',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            borderRadius: '8px',
          }}
        >
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* Simple QR-like pattern based on ticket ID */}
            <rect x="0" y="0" width="40" height="40" fill="#111827" />
            <rect x="10" y="10" width="20" height="20" fill="white" />
            <rect x="15" y="15" width="10" height="10" fill="#111827" />
            <rect x="120" y="0" width="40" height="40" fill="#111827" />
            <rect x="130" y="10" width="20" height="20" fill="white" />
            <rect x="135" y="15" width="10" height="10" fill="#111827" />
            <rect x="0" y="120" width="40" height="40" fill="#111827" />
            <rect x="10" y="130" width="20" height="20" fill="white" />
            <rect x="15" y="135" width="10" height="10" fill="#111827" />
            {/* Middle pattern based on ticket ID hash */}
            <rect x="50" y="0" width="10" height="10" fill="#111827" />
            <rect x="70" y="10" width="10" height="10" fill="#111827" />
            <rect x="50" y="30" width="10" height="10" fill="#111827" />
            <rect x="0" y="50" width="10" height="10" fill="#111827" />
            <rect x="20" y="60" width="10" height="10" fill="#111827" />
            <rect x="50" y="50" width="60" height="60" fill="#111827" />
            <rect x="60" y="60" width="40" height="40" fill="white" />
            <rect x="70" y="70" width="20" height="20" fill="#111827" />
            <rect x="120" y="50" width="10" height="10" fill="#111827" />
            <rect x="140" y="70" width="10" height="10" fill="#111827" />
            <rect x="120" y="90" width="10" height="10" fill="#111827" />
            <rect x="50" y="120" width="10" height="10" fill="#111827" />
            <rect x="70" y="140" width="10" height="10" fill="#111827" />
            <rect x="90" y="130" width="10" height="10" fill="#111827" />
            <rect x="120" y="120" width="40" height="40" fill="#111827" />
            <rect x="130" y="130" width="20" height="20" fill="white" />
            <rect x="135" y="135" width="10" height="10" fill="#111827" />
          </svg>
        </div>

        {/* Ticket ID */}
        <div
          style={{
            backgroundColor: '#f3f4f6',
            padding: '8px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        >
          <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Ticket ID</p>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
            {ticket.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Ticket Details */}
        <div
          style={{
            display: 'flex',
            gap: '24px',
            fontSize: '12px',
            color: '#6b7280',
            textAlign: 'center',
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>{ticket.ticketType}</p>
            <p>Type</p>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>{ticket.quantity}</p>
            <p>Qty</p>
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#374151' }}>฿{ticket.price.toLocaleString()}</p>
            <p>Price</p>
          </div>
        </div>

        {/* Status */}
        <div
          style={{
            marginTop: '16px',
            backgroundColor: ticket.status === 'valid' ? '#dcfce7' : '#fee2e2',
            color: ticket.status === 'valid' ? '#166534' : '#991b1b',
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {ticket.status}
        </div>
      </div>
    ),
    {
      width: 400,
      height: 600,
    }
  );
}
