import { create } from 'zustand';
import { db } from '../db/database';
import type { Appointment } from '../db/database';

interface AppointmentState {
  appointments: (Appointment & { id: number })[];
  isLoading: boolean;
  error: string | null;
  loadAppointments: () => Promise<void>;
  createAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Promise<void>;
  updateAppointment: (appointment: Appointment & { id: number }) => Promise<void>;
  deleteAppointment: (id: number) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  isLoading: false,
  error: null,
  
  loadAppointments: async () => {
    set({ isLoading: true, error: null });
    try {
      const appointments = await db.appointments.toArray();
      const sortedAppointments = appointments
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
      
      set({ 
        appointments: sortedAppointments as (Appointment & { id: number })[], 
        isLoading: false 
      });
    } catch (error) {
      console.error('Error loading appointments:', error);
      set({ error: 'Failed to load appointments', isLoading: false });
    }
  },

  createAppointment: async (appointment) => {
    set({ error: null });
    try {
      const id = await db.appointments.add({
        ...appointment,
        createdAt: new Date()
      });

      if (!id) {
        throw new Error('Failed to create appointment');
      }

      // Reload appointments after creation
      const appointments = await db.appointments.toArray();
      const sortedAppointments = appointments
        .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
      
      set({ appointments: sortedAppointments as (Appointment & { id: number })[] });
    } catch (error) {
      console.error('Error creating appointment:', error);
      set({ error: 'Failed to create appointment' });
      throw error;
    }
  },

  updateAppointment: async (appointment) => {
    set({ error: null });
    try {
      await db.appointments.put(appointment);
      await get().loadAppointments();
    } catch (error) {
      console.error('Error updating appointment:', error);
      set({ error: 'Failed to update appointment' });
      throw error;
    }
  },

  deleteAppointment: async (id) => {
    set({ error: null });
    try {
      await db.appointments.delete(id);
      await get().loadAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      set({ error: 'Failed to delete appointment' });
      throw error;
    }
  }
}));