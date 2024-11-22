import { format, formatDistanceToNow } from 'date-fns';
import type { Appointment } from '../db/database';

interface AppointmentListProps {
  title: string;
  appointments: (Appointment & { id: number })[];
  timeFormat?: 'time' | 'date' | 'relative';
}

export default function AppointmentList({ title, appointments, timeFormat = 'time' }: AppointmentListProps) {
  const formatTime = (datetime: string) => {
    const date = new Date(datetime);
    switch (timeFormat) {
      case 'time':
        return format(date, 'HH:mm');
      case 'date':
        return format(date, 'MMM d, HH:mm');
      case 'relative':
        return `${formatDistanceToNow(date)} ago`;
      default:
        return format(date, 'HH:mm');
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="divide-y divide-gray-200">
        {appointments.map((apt) => (
          <div key={apt.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-gray-900">
                  {apt.firstName} {apt.lastName}
                </p>
                <p className="text-sm text-gray-600">{apt.phone}</p>
                {apt.email && (
                  <p className="text-sm text-gray-500">{apt.email}</p>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatTime(apt.datetime)}
              </span>
            </div>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md mt-2">
              {apt.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}