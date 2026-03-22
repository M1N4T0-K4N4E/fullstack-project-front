import { User, Event, Ticket, TicketType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john@example.com',
    name: 'John Doe',
    phone: '081-234-5678',
    role: 'user',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'organizer-1',
    email: 'organizer@concert.com',
    name: 'Music Productions',
    phone: '089-876-5432',
    role: 'organizer',
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: 'admin-1',
    email: 'admin@tickale.com',
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
];

// Mock Ticket Types
const concertTicketTypes: TicketType[] = [
  { id: 'tt-1', name: 'VIP', price: 3500, quantity: 100, available: 45 },
  { id: 'tt-2', name: 'Regular', price: 1500, quantity: 500, available: 230, isEarlyBird: true, earlyBirdEndDate: '2026-03-30' },
  { id: 'tt-3', name: 'Early Bird', price: 1200, quantity: 200, available: 0 },
];

const workshopTicketTypes: TicketType[] = [
  { id: 'tt-4', name: 'Standard', price: 800, quantity: 50, available: 12 },
];

const sportsTicketTypes: TicketType[] = [
  { id: 'tt-5', name: 'Premium Seat', price: 2500, quantity: 200, available: 89 },
  { id: 'tt-6', name: 'General', price: 800, quantity: 1000, available: 456 },
];

// Mock Events
export const mockEvents: Event[] = [
  {
    id: 'event-1',
    title: 'Summer Music Festival 2026',
    description: 'Experience the ultimate music festival featuring top artists from around the world. Three days of non-stop music, amazing food, and unforgettable memories.',
    category: 'Concert',
    banner: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',
    startDate: '2026-05-15T16:00:00Z',
    endDate: '2026-05-17T23:00:00Z',
    venue: 'Central Park Amphitheater',
    address: '123 Park Avenue, Bangkok',
    ticketTypes: concertTicketTypes,
    organizerId: 'organizer-1',
    organizerName: 'Music Productions',
    status: 'published',
    featured: true,
    views: 1523,
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'event-2',
    title: 'Web Development Workshop',
    description: 'Intensive 2-day workshop on modern web development. Learn React, Next.js, and TypeScript from industry experts.',
    category: 'Workshop',
    banner: 'https://images.unsplash.com/photo-1544531586-fde5298cdd40?w=800',
    startDate: '2026-04-20T09:00:00Z',
    endDate: '2026-04-21T17:00:00Z',
    venue: 'Tech Hub Conference Center',
    address: '456 Innovation Road, Bangkok',
    ticketTypes: workshopTicketTypes,
    organizerId: 'organizer-1',
    organizerName: 'Music Productions',
    status: 'published',
    featured: false,
    views: 456,
    createdAt: '2026-02-15T14:00:00Z',
  },
  {
    id: 'event-3',
    title: 'Marathon Championship 2026',
    description: 'Join the biggest marathon event of the year. Multiple categories available from fun run to full marathon.',
    category: 'Sports',
    banner: 'https://images.unsplash.com/photo-1513593771513-7b58b6c4af38?w=800',
    startDate: '2026-06-01T05:00:00Z',
    endDate: '2026-06-01T14:00:00Z',
    venue: 'City Marathon Track',
    address: '789 Runners Lane, Bangkok',
    ticketTypes: sportsTicketTypes,
    organizerId: 'organizer-1',
    organizerName: 'Music Productions',
    status: 'published',
    featured: true,
    views: 2341,
    createdAt: '2026-01-20T09:00:00Z',
  },
  {
    id: 'event-4',
    title: 'Tech Leadership Summit',
    description: 'Annual gathering of tech leaders discussing the future of technology and innovation.',
    category: 'Seminar',
    banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    startDate: '2026-04-10T08:00:00Z',
    endDate: '2026-04-10T18:00:00Z',
    venue: 'Grand Convention Center',
    address: '321 Business Blvd, Bangkok',
    ticketTypes: [
      { id: 'tt-7', name: 'VIP Access', price: 5000, quantity: 50, available: 12 },
      { id: 'tt-8', name: 'Standard', price: 2000, quantity: 300, available: 156 },
    ],
    organizerId: 'organizer-1',
    organizerName: 'Music Productions',
    status: 'published',
    featured: false,
    views: 789,
    createdAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 'event-5',
    title: 'Food Festival Bangkok',
    description: 'Celebrate the diverse culinary scene of Bangkok with over 100 food vendors and live entertainment.',
    category: 'Festival',
    banner: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    startDate: '2026-03-25T10:00:00Z',
    endDate: '2026-03-29T22:00:00Z',
    venue: 'Siam Paragon',
    address: '991 Rama I Road, Bangkok',
    ticketTypes: [
      { id: 'tt-9', name: 'Entry Pass', price: 200, quantity: 5000, available: 2340 },
      { id: 'tt-10', name: 'VIP Pass', price: 800, quantity: 200, available: 45 },
    ],
    organizerId: 'organizer-1',
    organizerName: 'Music Productions',
    status: 'published',
    featured: true,
    views: 5672,
    createdAt: '2026-02-25T16:00:00Z',
  },
];

// Mock Tickets
export const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    eventId: 'event-1',
    eventTitle: 'Summer Music Festival 2026',
    eventDate: '2026-05-15T16:00:00Z',
    venue: 'Central Park Amphitheater',
    userId: 'user-1',
    userName: 'John Doe',
    ticketType: 'VIP',
    price: 3500,
    quantity: 2,
    status: 'valid',
    qrCode: 'QR-TICKET-001',
    purchasedAt: '2026-03-10T14:30:00Z',
  },
  {
    id: 'ticket-2',
    eventId: 'event-3',
    eventTitle: 'Marathon Championship 2026',
    eventDate: '2026-06-01T05:00:00Z',
    venue: 'City Marathon Track',
    userId: 'user-1',
    userName: 'John Doe',
    ticketType: 'General',
    price: 800,
    quantity: 1,
    status: 'valid',
    qrCode: 'QR-TICKET-002',
    purchasedAt: '2026-03-12T09:15:00Z',
  },
];

// Helper to generate unique IDs
export const generateId = (): string => uuidv4();

// Helper to find user by email (for mock auth)
export const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(u => u.email === email);
};

// Helper to validate user credentials (mock)
export const validateCredentials = (email: string, password: string): User | null => {
  // In a real app, we'd check hashed passwords
  // For mock purposes, any password works for existing users
  const user = findUserByEmail(email);
  if (user && password.length >= 1) {
    return user;
  }
  return null;
};

// Helper to get event by ID
export const getEventById = (id: string): Event | undefined => {
  return mockEvents.find(e => e.id === id);
};

// Helper to get tickets by user ID
export const getTicketsByUserId = (userId: string): Ticket[] => {
  return mockTickets.filter(t => t.userId === userId);
};

// Helper to get tickets by event ID (for organizer)
export const getTicketsByEventId = (eventId: string): Ticket[] => {
  return mockTickets.filter(t => t.eventId === eventId);
};
