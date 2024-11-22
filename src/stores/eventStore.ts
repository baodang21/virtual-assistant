import { create } from 'zustand';
import { db } from '../db/database';
import type { Event, EventStatus } from '../db/database';

interface EventState {
  events: (Event & { id: number })[];
  isLoading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  createEvent: (event: Omit<Event, 'id' | 'createdAt'>) => Promise<void>;
  updateEventStatus: (id: number, status: EventStatus) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  updateEvent: (event: Event & { id: number }) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,
  
  loadEvents: async () => {
    if (get().isLoading) return;
    
    set({ isLoading: true, error: null });
    try {
      const events = await db.events.toArray();
      const sortedEvents = events
        .sort((a: Event, b: Event) => 
          new Date(a.fromDatetime).getTime() - new Date(b.fromDatetime).getTime()
        );
      
      set({ events: sortedEvents as (Event & { id: number })[], isLoading: false });
    } catch (error) {
      console.error('Error loading events:', error);
      set({ error: 'Failed to load events', isLoading: false });
    }
  },

  createEvent: async (event) => {
    set({ error: null });
    try {
      const id = await db.events.add({
        ...event,
        createdAt: new Date()
      });

      if (!id) {
        throw new Error('Failed to create event');
      }

      await get().loadEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      set({ error: 'Failed to create event' });
      throw error;
    }
  },

  updateEventStatus: async (id: number, status: EventStatus) => {
    set({ error: null });
    try {
      await db.events.update(id, { status });
      await get().loadEvents();
    } catch (error) {
      console.error('Error updating event status:', error);
      set({ error: 'Failed to update event status' });
      throw error;
    }
  },

  deleteEvent: async (id) => {
    set({ error: null });
    try {
      await db.events.delete(id);
      await get().loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      set({ error: 'Failed to delete event' });
      throw error;
    }
  },

  updateEvent: async (event) => {
    set({ error: null });
    try {
      await db.events.put(event);
      await get().loadEvents();
    } catch (error) {
      console.error('Error updating event:', error);
      set({ error: 'Failed to update event' });
      throw error;
    }
  }
}));