export type UserRole = 'user' | 'organizer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity: number;
  available: number;
  isEarlyBird?: boolean;
  earlyBirdEndDate?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  banner: string;
  startDate: string;
  endDate: string;
  venue: string;
  address: string;
  ticketTypes: TicketType[];
  organizerId: string;
  organizerName: string;
  status: 'draft' | 'published' | 'cancelled';
  featured: boolean;
  views: number;
  createdAt: string;
}

export type TicketStatus = 'valid' | 'used' | 'cancelled' | 'refunded';

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  userId: string;
  userName: string;
  ticketType: string;
  price: number;
  quantity: number;
  status: TicketStatus;
  qrCode: string;
  purchasedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface BookingRequest {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
}

export interface BookingResponse {
  ticket: Ticket;
  success: boolean;
}
