import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Call {
  id: string;
  name: string;
  phoneNumber: string;
  issue: string;
  startTime: string;
  endTime: string;
}

interface CallStore {
  calls: Call[];
  logCall: (call: Omit<Call, 'id'>) => void;
}

export const useCallStore = create<CallStore>()(
  persist(
    (set) => ({
      calls: [
        {
          id: '1',
          name: 'John Smith',
          phoneNumber: '(555) 123-4567',
          issue: 'Scheduled consultation for next week',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 3540000).toISOString()
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          phoneNumber: '(555) 987-6543',
          issue: 'Rescheduled appointment to Friday',
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 7140000).toISOString()
        }
      ],
      logCall: (call) =>
        set((state) => ({
          calls: [
            { ...call, id: crypto.randomUUID() },
            ...state.calls
          ].slice(0, 100)
        })),
    }),
    {
      name: 'call-store',
    }
  )
);