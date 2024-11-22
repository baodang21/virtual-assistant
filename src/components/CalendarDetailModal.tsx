import { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { format } from 'date-fns';
import { useEventStore } from '../stores/eventStore';
import { useAppointmentStore } from '../stores/appointmentStore';
import type { Event, EventStatus, Appointment } from '../db/database';

interface CalendarDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: {
    type: 'event' | 'appointment';
    data: (Event | Appointment) & { id: number };
  };
}

export default function CalendarDetailModal({ isOpen, onClose, item }: CalendarDetailModalProps) {
  const { updateEvent, deleteEvent } = useEventStore();
  const { updateAppointment, deleteAppointment } = useAppointmentStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    status: 'ongoing' as EventStatus,
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    note: '',
    fromDate: format(new Date(), 'yyyy-MM-dd'),
    fromTime: '10:00',
    toDate: format(new Date(), 'yyyy-MM-dd'),
    toTime: '11:00'
  });

  useEffect(() => {
    if (item?.data) {
      if (item.type === 'event') {
        const eventData = item.data as Event & { id: number };
        const fromDatetime = new Date(eventData.fromDatetime);
        const toDatetime = new Date(eventData.toDatetime);
        setFormData(prev => ({
          ...prev,
          title: eventData.title || '',
          description: eventData.description || '',
          location: eventData.location || '',
          status: eventData.status,
          fromDate: format(fromDatetime, 'yyyy-MM-dd'),
          fromTime: format(fromDatetime, 'HH:mm'),
          toDate: format(toDatetime, 'yyyy-MM-dd'),
          toTime: format(toDatetime, 'HH:mm')
        }));
      } else {
        const appointmentData = item.data as Appointment & { id: number };
        const datetime = new Date(appointmentData.datetime);
        const endDatetime = new Date(datetime.getTime() + 60 * 60 * 1000);
        setFormData(prev => ({
          ...prev,
          firstName: appointmentData.firstName || '',
          lastName: appointmentData.lastName || '',
          phone: appointmentData.phone || '',
          email: appointmentData.email || '',
          note: appointmentData.note || '',
          fromDate: format(datetime, 'yyyy-MM-dd'),
          fromTime: format(datetime, 'HH:mm'),
          toDate: format(endDatetime, 'yyyy-MM-dd'),
          toTime: format(endDatetime, 'HH:mm')
        }));
      }
    }
  }, [item]);

  const handleClose = () => {
    setIsEditing(false);
    setFormData({
      title: '',
      description: '',
      location: '',
      status: 'ongoing',
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      note: '',
      fromDate: format(new Date(), 'yyyy-MM-dd'),
      fromTime: '10:00',
      toDate: format(new Date(), 'yyyy-MM-dd'),
      toTime: '11:00'
    });
    onClose();
  };

  const handleDelete = async () => {
    if (!item?.data.id) return;
    
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      if (item.type === 'event') {
        await deleteEvent(item.data.id);
      } else {
        await deleteAppointment(item.data.id);
      }
      handleClose();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!item?.data.id) return;

    const fromDatetime = new Date(`${formData.fromDate}T${formData.fromTime}`);
    const toDatetime = new Date(`${formData.toDate}T${formData.toTime}`);

    if (fromDatetime >= toDatetime) {
      alert('End time must be after start time');
      return;
    }
    
    try {
      if (item.type === 'event') {
        const eventData = item.data as Event & { id: number };
        await updateEvent({
          ...eventData,
          title: formData.title.trim(),
          description: formData.description,
          location: formData.location,
          status: formData.status,
          fromDatetime: fromDatetime.toISOString(),
          toDatetime: toDatetime.toISOString()
        });
      } else {
        const appointmentData = item.data as Appointment & { id: number };
        await updateAppointment({
          ...appointmentData,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email || undefined,
          note: formData.note,
          datetime: fromDatetime.toISOString()
        });
      }
      handleClose();
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-xl w-full">
          <div className="flex justify-between items-start mb-4">
            <Dialog.Title className="text-xl font-bold">
              {isEditing ? 'Edit ' : ''}{item.type === 'event' ? 'Event' : 'Appointment'} Details
            </Dialog.Title>
            {!isEditing && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
                  title="Edit"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {isEditing ? (
              // Edit Form
              <>
                {item.type === 'event' ? (
                  // Event Form
                  <>
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
                  </>
                ) : (
                  // Appointment Form
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Note</label>
                      <textarea
                        value={formData.note}
                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {/* Date/Time Fields */}
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
              </>
            ) : (
              // View Mode
              <div className="space-y-4">
                {item.type === 'event' ? (
                  // Event Details
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Title</h3>
                      <p className="mt-1">{(item.data as Event).title}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1">{(item.data as Event).description || 'No description'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Location</h3>
                      <p className="mt-1">{(item.data as Event).location || 'No location'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <p className="mt-1 capitalize">{(item.data as Event).status}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">From</h3>
                      <p className="mt-1">
                        {format(new Date((item.data as Event).fromDatetime), 'PPpp')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">To</h3>
                      <p className="mt-1">
                        {format(new Date((item.data as Event).toDatetime), 'PPpp')}
                      </p>
                    </div>
                  </>
                ) : (
                  // Appointment Details
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Name</h3>
                      <p className="mt-1">
                        {(item.data as Appointment).firstName} {(item.data as Appointment).lastName}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="mt-1">{(item.data as Appointment).phone}</p>
                    </div>
                    {(item.data as Appointment).email && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1">{(item.data as Appointment).email}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Note</h3>
                      <p className="mt-1">{(item.data as Appointment).note || 'No note'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                      <p className="mt-1">
                        {format(new Date((item.data as Appointment).datetime), 'PPpp')}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {isEditing ? 'Cancel' : 'Close'}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}