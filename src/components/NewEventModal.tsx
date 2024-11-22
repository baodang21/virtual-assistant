import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { useEventStore } from '../stores/eventStore';
import type { EventStatus } from '../db/database';
import { format } from 'date-fns';

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialDate?: Date | null;
}

export default function NewEventModal({ isOpen, onClose, onSave, initialDate }: NewEventModalProps) {
  const { createEvent } = useEventStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    status: 'ongoing' as EventStatus,
    fromDate: format(new Date(), 'yyyy-MM-dd'),
    fromTime: '10:00',
    toDate: format(new Date(), 'yyyy-MM-dd'),
    toTime: '11:00'
  });

  useEffect(() => {
    if (initialDate) {
      const toDate = new Date(initialDate);
      toDate.setHours(toDate.getHours() + 1);
      
      setFormData(prev => ({
        ...prev,
        fromDate: format(initialDate, 'yyyy-MM-dd'),
        fromTime: format(initialDate, 'HH:mm'),
        toDate: format(toDate, 'yyyy-MM-dd'),
        toTime: format(toDate, 'HH:mm')
      }));
    }
  }, [initialDate]);

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      status: 'ongoing',
      fromDate: format(new Date(), 'yyyy-MM-dd'),
      fromTime: '10:00',
      toDate: format(new Date(), 'yyyy-MM-dd'),
      toTime: '11:00'
    });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Title is required');
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const fromDatetime = new Date(`${formData.fromDate}T${formData.fromTime}`);
      const toDatetime = new Date(`${formData.toDate}T${formData.toTime}`);

      if (fromDatetime >= toDatetime) {
        alert('End time must be after start time');
        return;
      }
      
      await createEvent({
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        status: formData.status,
        fromDatetime: fromDatetime.toISOString(),
        toDatetime: toDatetime.toISOString()
      });
      
      onSave();
      handleClose();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl w-full">
          <Dialog.Title className="text-xl font-bold mb-4">New Event</Dialog.Title>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as EventStatus })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ongoing">Ongoing</option>
                <option value="canceled">Canceled</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={formData.fromDate}
                      onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      value={formData.fromTime}
                      onChange={(e) => setFormData({ ...formData, fromTime: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date</label>
                    <input
                      type="date"
                      value={formData.toDate}
                      onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Time</label>
                    <input
                      type="time"
                      value={formData.toTime}
                      onChange={(e) => setFormData({ ...formData, toTime: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Event'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}