import { User, Event, Ticket, BookingRequest } from '@/types';
import {
  mockUsers,
  mockEvents,
  mockTickets,
  findUserByEmail,
  generateId,
  getEventById,
} from './mock-data';

// Users API
export const usersApi = {
  getAll: (): User[] => mockUsers,

  getById: (id: string): User | undefined => mockUsers.find((u) => u.id === id),

  getByEmail: (email: string): User | undefined => findUserByEmail(email),

  create: (data: Omit<User, 'id' | 'createdAt'>): User => {
    const newUser: User = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return newUser;
  },

  update: (id: string, data: Partial<User>): User | null => {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      mockUsers[index] = { ...mockUsers[index], ...data };
      return mockUsers[index];
    }
    return null;
  },
};

// Events API
export const eventsApi = {
  getAll: (): Event[] => mockEvents,

  getById: (id: string): Event | undefined => getEventById(id),

  getByOrganizer: (organizerId: string): Event[] =>
    mockEvents.filter((e) => e.organizerId === organizerId),

  create: (data: Omit<Event, 'id' | 'createdAt' | 'views'>): Event => {
    const newEvent: Event = {
      ...data,
      id: generateId(),
      views: 0,
      createdAt: new Date().toISOString(),
    };
    mockEvents.push(newEvent);
    return newEvent;
  },

  update: (id: string, data: Partial<Event>): Event | null => {
    const index = mockEvents.findIndex((e) => e.id === id);
    if (index !== -1) {
      mockEvents[index] = { ...mockEvents[index], ...data };
      return mockEvents[index];
    }
    return null;
  },

  delete: (id: string): boolean => {
    const index = mockEvents.findIndex((e) => e.id === id);
    if (index !== -1) {
      mockEvents.splice(index, 1);
      return true;
    }
    return false;
  },
};

// Tickets API
export const ticketsApi = {
  getAll: (): Ticket[] => mockTickets,

  getById: (id: string): Ticket | undefined => mockTickets.find((t) => t.id === id),

  getByUser: (userId: string): Ticket[] => mockTickets.filter((t) => t.userId === userId),

  getByEvent: (eventId: string): Ticket[] => mockTickets.filter((t) => t.eventId === eventId),

  purchase: (
    request: BookingRequest,
    userId: string,
    userName: string
  ): Ticket | null => {
    const event = getEventById(request.eventId);
    if (!event) return null;

    const ticketType = event.ticketTypes.find((tt) => tt.id === request.ticketTypeId);
    if (!ticketType) return null;
    if (ticketType.available < request.quantity) return null;

    // Decrease available tickets
    ticketType.available -= request.quantity;

    const newTicket: Ticket = {
      id: generateId(),
      eventId: event.id,
      eventTitle: event.title,
      eventDate: event.startDate,
      venue: event.venue,
      userId,
      userName,
      ticketType: ticketType.name,
      price: ticketType.price * request.quantity,
      quantity: request.quantity,
      status: 'valid',
      qrCode: `QR-${generateId().slice(0, 8).toUpperCase()}`,
      purchasedAt: new Date().toISOString(),
    };

    mockTickets.push(newTicket);
    return newTicket;
  },

  updateStatus: (id: string, status: Ticket['status']): Ticket | null => {
    const index = mockTickets.findIndex((t) => t.id === id);
    if (index !== -1) {
      mockTickets[index].status = status;
      return mockTickets[index];
    }
    return null;
  },
};
