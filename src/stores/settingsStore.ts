import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SettingsState {
  allowAppointmentOverlap: boolean;
  allowEventOverlap: boolean;
  updateSettings: (settings: Partial<Omit<SettingsState, 'updateSettings'>>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      allowAppointmentOverlap: false,
      allowEventOverlap: false,
      updateSettings: (newSettings) => 
        set((state) => ({ ...state, ...newSettings })),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);