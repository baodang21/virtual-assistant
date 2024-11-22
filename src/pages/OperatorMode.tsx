import { useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer, SlotInfo } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { useEffect, useState } from 'react';
import { useEventStore } from '../stores/eventStore';
import { useAppointmentStore } from '../stores/appointmentStore';
import SearchBox from '../components/SearchBox';
import EventList from '../components/EventList';
import NewEventModal from '../components/NewEventModal';
import NewAppointmentModal from '../components/NewAppointmentModal';
import SettingsModal from '../components/SettingsModal';
import CalendarDetailModal from '../components/CalendarDetailModal';
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

export default function OperatorMode() {
  const navigate = useNavigate();
  const { events, loadEvents } = useEventStore();
  const { appointments, loadAppointments } = useAppointmentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedCalendarItem, setSelectedCalendarItem] = useState<{
    type: 'event' | 'appointment';
    data: any;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        await Promise.all([loadEvents(), loadAppointments()]);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please refresh the page.');
      }
    };
    loadData();
  }, [loadEvents, loadAppointments]);

  // Combine events and appointments for calendar
  const calendarItems = [
    ...events.map(event => ({
      id: `event-${event.id}`,
      title: event.title,
      start: new Date(event.fromDatetime),
      end: new Date(event.toDatetime),
      resource: { type: 'event', data: event }
    })),
    ...appointments.map(apt => ({
      id: `apt-${apt.id}`,
      title: `${apt.firstName} ${apt.lastName}`,
      start: new Date(apt.datetime),
      end: new Date(new Date(apt.datetime).getTime() + 60 * 60 * 1000),
      resource: { type: 'appointment', data: apt }
    }))
  ];

  // Filter and format items for the list
  const listItems = [
    ...events.map(event => ({
      id: event.id!,
      type: 'event' as const,
      title: event.title,
      subtitle: event.location,
      description: event.description,
      status: event.status,
      datetime: event.fromDatetime
    })),
    ...appointments.map(apt => ({
      id: apt.id!,
      type: 'appointment' as const,
      title: `${apt.firstName} ${apt.lastName}`,
      subtitle: apt.phone,
      description: apt.note,
      datetime: apt.datetime
    }))
  ].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  const filteredItems = listItems.filter(item => {
    const searchLower = searchQuery.toLowerCase();
    if (item.type === 'event') {
      return item.title.toLowerCase().includes(searchLower) ||
             item.description.toLowerCase().includes(searchLower);
    } else {
      return item.title.toLowerCase().includes(searchLower) ||
             item.subtitle.includes(searchLower);
    }
  });

  const handleSelectEvent = (event: any) => {
    setSelectedCalendarItem(event.resource);
  };

  const handleSelectSlot = ({ start }: SlotInfo) => {
    setSelectedDate(start);
    setIsNewEventModalOpen(true);
  };

  const handleNewEventModalClose = () => {
    setIsNewEventModalOpen(false);
    setSelectedDate(null);
  };

  const handleNewAppointmentModalClose = () => {
    setIsNewAppointmentModalOpen(false);
    setSelectedDate(null);
  };

  const handleCloseCalendarDetail = () => {
    setSelectedCalendarItem(null);
    loadEvents();
    loadAppointments();
  };

  // Custom event component for Week and Day views
  const components = {
    event: (props: any) => (
      <div className={`rbc-event ${props.event.resource.type === 'event' ? 'bg-blue-500' : 'bg-green-500'}`}>
        <div className="rbc-event-content">{props.event.title}</div>
      </div>
    )
  };

  // Custom formats to control date/time display
  const formats = {
    eventTimeRangeFormat: () => '', // Remove time range in Week/Day view
    eventTimeRangeEndFormat: () => '', // Remove end time
    timeGutterFormat: 'HH:mm', // Keep time in the gutter
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => navigate('/')} className="mr-4">
            ← Back
          </button>
          <h1 className="text-2xl font-bold">Operator Mode</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Settings
          </button>
          <button
            onClick={() => setIsNewAppointmentModalOpen(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            New Appointment
          </button>
          <button
            onClick={() => setIsNewEventModalOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            New Event
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Events and Appointments List */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Events & Appointments</h2>
                <div className="w-64">
                  <SearchBox
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="Search events & appointments..."
                  />
                </div>
              </div>

              <div className="space-y-8">
                {filteredItems.length > 0 ? (
                  <EventList
                    title="All Items"
                    items={filteredItems}
                    timeFormat="date"
                  />
                ) : (
                  <p className="text-center text-gray-500">No events or appointments found</p>
                )}
              </div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Calendar</h2>
            <div style={{ height: 700 }}>
              <Calendar
                localizer={localizer}
                events={calendarItems}
                startAccessor="start"
                endAccessor="end"
                views={['month', 'week', 'day', 'agenda']}
                defaultView="month"
                onSelectEvent={handleSelectEvent}
                selectable={true}
                onSelectSlot={handleSelectSlot}
                components={components}
                formats={formats}
                className="rounded-lg"
                eventPropGetter={(event) => ({
                  className: event.resource.type === 'event' ? 'bg-blue-500' : 'bg-green-500'
                })}
                tooltipAccessor={(event) => event.title}
              />
            </div>
          </div>
        </div>
      </main>

      <NewEventModal
        isOpen={isNewEventModalOpen}
        onClose={handleNewEventModalClose}
        onSave={async () => {
          await loadEvents();
          setSelectedDate(null);
          setIsNewEventModalOpen(false);
        }}
        initialDate={selectedDate}
      />

      <NewAppointmentModal
        isOpen={isNewAppointmentModalOpen}
        onClose={handleNewAppointmentModalClose}
        onSave={async () => {
          await loadAppointments();
          setSelectedDate(null);
          setIsNewAppointmentModalOpen(false);
        }}
        initialDate={selectedDate}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <CalendarDetailModal
        isOpen={!!selectedCalendarItem}
        onClose={handleCloseCalendarDetail}
        item={selectedCalendarItem || undefined}
      />
    </div>
  );
}