import { create } from 'zustand';
import { Event, TicketType } from '@/types';
import { mockEvents, getEventById, generateId } from '@/lib/mock-data';

interface EventFilters {
  search: string;
  category: string;
  dateFrom: string;
  dateTo: string;
  priceMin: number;
  priceMax: number;
  sortBy: 'date' | 'price' | 'popularity';
}

interface EventStore {
  events: Event[];
  selectedEvent: Event | null;
  filters: EventFilters;
  isLoading: boolean;
  setEvents: () => void;
  setSelectedEvent: (id: string) => void;
  setFilters: (filters: Partial<EventFilters>) => void;
  getFilteredEvents: () => Event[];
  createEvent: (event: Omit<Event, 'id' | 'createdAt' | 'views'>) => Event;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEventsByOrganizer: (organizerId: string) => Event[];
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  selectedEvent: null,
  filters: {
    search: '',
    category: '',
    dateFrom: '',
    dateTo: '',
    priceMin: 0,
    priceMax: 99999,
    sortBy: 'date',
  },
  isLoading: false,

  setEvents: () => {
    set({ events: mockEvents });
  },

  setSelectedEvent: (id: string) => {
    const event = getEventById(id);
    set({ selectedEvent: event || null });
  },

  setFilters: (filters: Partial<EventFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  getFilteredEvents: () => {
    const { events, filters } = get();
    let filtered = [...events];

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchLower) ||
          e.description.toLowerCase().includes(searchLower) ||
          e.venue.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter((e) => e.category === filters.category);
    }

    // Filter by date range
    if (filters.dateFrom) {
      filtered = filtered.filter((e) => new Date(e.startDate) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter((e) => new Date(e.endDate) <= new Date(filters.dateTo));
    }

    // Filter by price range (based on cheapest ticket type)
    filtered = filtered.filter((e) => {
      const cheapestPrice = Math.min(...e.ticketTypes.map((t) => t.price));
      return cheapestPrice >= filters.priceMin && cheapestPrice <= filters.priceMax;
    });

    // Sort
    switch (filters.sortBy) {
      case 'date':
        filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        break;
      case 'price':
        filtered.sort((a, b) => {
          const aPrice = Math.min(...a.ticketTypes.map((t) => t.price));
          const bPrice = Math.min(...b.ticketTypes.map((t) => t.price));
          return aPrice - bPrice;
        });
        break;
      case 'popularity':
        filtered.sort((a, b) => b.views - a.views);
        break;
    }

    return filtered;
  },

  createEvent: (eventData) => {
    const newEvent: Event = {
      ...eventData,
      id: generateId(),
      views: 0,
      createdAt: new Date().toISOString(),
    };
    mockEvents.push(newEvent);
    set({ events: mockEvents });
    return newEvent;
  },

  updateEvent: (id: string, eventUpdate: Partial<Event>) => {
    const index = mockEvents.findIndex((e) => e.id === id);
    if (index !== -1) {
      mockEvents[index] = { ...mockEvents[index], ...eventUpdate };
      set({ events: [...mockEvents] });
    }
  },

  deleteEvent: (id: string) => {
    const index = mockEvents.findIndex((e) => e.id === id);
    if (index !== -1) {
      mockEvents.splice(index, 1);
      set({ events: [...mockEvents] });
    }
  },

  getEventsByOrganizer: (organizerId: string) => {
    return mockEvents.filter((e) => e.organizerId === organizerId);
  },
}));
