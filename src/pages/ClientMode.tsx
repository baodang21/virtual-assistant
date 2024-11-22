import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { useAppointmentStore } from '../stores/appointmentStore';
import { useEventStore } from '../stores/eventStore';
import { useSettingsStore } from '../stores/settingsStore';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function ClientMode() {
  const navigate = useNavigate();
  const { appointments, createAppointment, loadAppointments } = useAppointmentStore();
  const { events, loadEvents } = useEventStore();
  const { allowEventOverlap } = useSettingsStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    note: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '10:00'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadAppointments(), loadEvents()]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, [loadAppointments, loadEvents]);

  const handleSelectSlot = ({ start }: SlotInfo) => {
    setSelectedDate(start);
    setFormData(prev => ({
      ...prev,
      date: format(start, 'yyyy-MM-dd'),
      time: format(start, 'HH:mm')
    }));
  };

  // Create calendar events from both events and appointments
  const calendarItems = [
    ...events.map(event => ({
      id: `event-${event.id}`,
      title: '', // Hide event title
      start: new Date(event.fromDatetime),
      end: new Date(event.toDatetime),
      resource: { type: 'event' }
    })),
    ...appointments.map(apt => ({
      id: `apt-${apt.id}`,
      title: '', // Hide appointment name
      start: new Date(apt.datetime),
      end: new Date(new Date(apt.datetime).getTime() + 60 * 60 * 1000),
      resource: { type: 'appointment' }
    }))
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const datetime = new Date(`${formData.date}T${formData.time}`);
      
      // Check for appointment overlap
      const hasAppointmentOverlap = appointments.some(apt => {
        const aptStart = new Date(apt.datetime);
        const aptEnd = new Date(aptStart.getTime() + 60 * 60 * 1000);
        const newStart = datetime;
        const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
        
        return (
          (newStart >= aptStart && newStart < aptEnd) ||
          (newEnd > aptStart && newEnd <= aptEnd) ||
          (newStart <= aptStart && newEnd >= aptEnd)
        );
      });

      if (hasAppointmentOverlap) {
        alert('This time slot is already booked. Please select a different time.');
        return;
      }

      // Check for event overlap if allowEventOverlap is false
      if (!allowEventOverlap) {
        const hasEventOverlap = events.some(event => {
          const eventStart = new Date(event.fromDatetime);
          const eventEnd = new Date(event.toDatetime);
          const newStart = datetime;
          const newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
          
          return (
            (newStart >= eventStart && newStart < eventEnd) ||
            (newEnd > eventStart && newEnd <= eventEnd) ||
            (newStart <= eventStart && newEnd >= eventEnd)
          );
        });

        if (hasEventOverlap) {
          alert('This time slot overlaps with an existing event. Please select a different time.');
          return;
        }
      }
      
      await createAppointment({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        note: formData.note.trim(),
        datetime: datetime.toISOString()
      });

      // Reset form and selected date
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        note: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        time: '10:00'
      });
      setSelectedDate(null);

      await loadAppointments();
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectEvent = () => {
    // This is intentionally empty as we don't want to handle event selection
    // but we need it to satisfy the prop type warning
  };

  // Custom event component for Week and Day views
  const components = {
    event: (props: any) => (
      <div className={`rbc-event ${props.event.resource.type === 'event' ? 'bg-blue-500' : 'bg-green-500'}`}>
        <div className="rbc-event-content"></div>
      </div>
    )
  };

  // Custom formats to control date/time display
  const formats = {
    eventTimeRangeFormat: () => '', // Remove time range in Week/Day view
    eventTimeRangeEndFormat: () => '', // Remove end time
    timeGutterFormat: 'HH:mm', // Keep time in the gutter
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-green-600 text-white p-4 flex items-center">
        <button onClick={() => navigate('/')} className="mr-4">
          ← Back
        </button>
        <h1 className="text-2xl font-bold">Client Mode</h1>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Select Appointment Date</h2>
            <div className="mb-4">
              <div className="text-sm text-gray-600">
                Events are shown in blue and appointments in green. Click on any date to schedule your appointment.
                {selectedDate && (
                  <div className="mt-2 text-green-600">
                    Selected date: {format(selectedDate, 'MMMM d, yyyy')}
                  </div>
                )}
              </div>
            </div>
            <div style={{ height: 600 }}>
              <Calendar
                localizer={localizer}
                events={calendarItems}
                startAccessor="start"
                endAccessor="end"
                views={['month', 'week', 'day']}
                defaultView="month"
                selectable={true}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selected={selectedDate}
                components={components}
                formats={formats}
                className="rounded-lg"
                eventPropGetter={(event) => ({
                  className: event.resource.type === 'event' ? 'bg-blue-500' : 'bg-green-500'
                })}
              />
            </div>
          </div>

          {/* Book Appointment Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Book Appointment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}