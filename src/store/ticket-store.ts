import { create } from 'zustand';
import { Ticket, TicketStatus, BookingRequest } from '@/types';
import { mockTickets, generateId, getTicketsByUserId, getTicketsByEventId } from '@/lib/mock-data';

interface TicketStore {
  tickets: Ticket[];
  isLoading: boolean;
  setTickets: () => void;
  getTicketsByUser: (userId: string) => Ticket[];
  getTicketsByEvent: (eventId: string) => Ticket[];
  getTicketById: (id: string) => Ticket | undefined;
  purchaseTicket: (request: BookingRequest, userName: string, userId: string) => Ticket | null;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  cancelTicket: (id: string) => void;
}

export const useTicketStore = create<TicketStore>((set, get) => ({
  tickets: [],
  isLoading: false,

  setTickets: () => {
    set({ tickets: mockTickets });
  },

  getTicketsByUser: (userId: string) => {
    return get().tickets.filter((t) => t.userId === userId);
  },

  getTicketsByEvent: (eventId: string) => {
    return get().tickets.filter((t) => t.eventId === eventId);
  },

  getTicketById: (id: string) => {
    return get().tickets.find((t) => t.id === id);
  },

  purchaseTicket: (request: BookingRequest, userName: string, userId: string) => {
    const { tickets } = get();
    const ticketId = generateId();

    const newTicket: Ticket = {
      id: ticketId,
      eventId: request.eventId,
      eventTitle: '', // Will be populated
      eventDate: '', // Will be populated
      venue: '', // Will be populated
      userId,
      userName,
      ticketType: '', // Will be populated
      price: 0, // Will be calculated
      quantity: request.quantity,
      status: 'valid',
      qrCode: `QR-${ticketId.slice(0, 8).toUpperCase()}`,
      purchasedAt: new Date().toISOString(),
    };

    mockTickets.push(newTicket);
    set({ tickets: [...mockTickets] });
    return newTicket;
  },

  updateTicketStatus: (id: string, status: TicketStatus) => {
    const index = mockTickets.findIndex((t) => t.id === id);
    if (index !== -1) {
      mockTickets[index].status = status;
      set({ tickets: [...mockTickets] });
    }
  },

  cancelTicket: (id: string) => {
    get().updateTicketStatus(id, 'cancelled');
  },
}));
