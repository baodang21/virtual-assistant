import { Dialog } from '@headlessui/react';
import { useSettingsStore } from '../stores/settingsStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { allowAppointmentOverlap, allowEventOverlap, updateSettings } = useSettingsStore();

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl">
          <Dialog.Title className="text-xl font-bold mb-4">Settings</Dialog.Title>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <label className="flex-grow text-sm font-medium text-gray-700">
                Allow appointments to overlap with other appointments
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={allowAppointmentOverlap}
                onClick={() => updateSettings({ allowAppointmentOverlap: !allowAppointmentOverlap })}
                className={`${
                  allowAppointmentOverlap ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  aria-hidden="true"
                  className={`${
                    allowAppointmentOverlap ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex-grow text-sm font-medium text-gray-700">
                Allow appointments to overlap with events
              </label>
              <button
                type="button"
                role="switch"
                aria-checked={allowEventOverlap}
                onClick={() => updateSettings({ allowEventOverlap: !allowEventOverlap })}
                className={`${
                  allowEventOverlap ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              >
                <span
                  aria-hidden="true"
                  className={`${
                    allowEventOverlap ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}