import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { ticketsApi } from '@/lib/api';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = ticketsApi.getById(id);

  if (!ticket) {
    return new Response('Ticket not found', { status: 404 });
  }

  const qrDataUrl = await QRCode.toDataURL(ticket.qrCode || ticket.id, {
    width: 300,
    margin: 2,
    color: { dark: '#000000', light: '#ffffff' },
  });

  const base64 = qrDataUrl.split(',')[1];
  const buffer = Buffer.from(base64, 'base64');

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
