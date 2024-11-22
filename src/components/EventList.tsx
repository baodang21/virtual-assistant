import { format, formatDistanceToNow } from 'date-fns';
import type { EventStatus } from '../db/database';

interface Item {
  id: number;
  type: 'event' | 'appointment';
  title: string;
  subtitle: string;
  description: string;
  status?: EventStatus;
  datetime: string;
}

interface EventListProps {
  title: string;
  items: Item[];
  timeFormat?: 'time' | 'date' | 'relative';
  onStatusChange?: (id: number, status: EventStatus) => void;
}

const statusColors: Record<EventStatus, string> = {
  ongoing: 'bg-blue-100 text-blue-800',
  canceled: 'bg-red-100 text-red-800',
  done: 'bg-green-100 text-green-800'
};

const typeColors: Record<Item['type'], string> = {
  event: 'bg-blue-100 text-blue-800',
  appointment: 'bg-green-100 text-green-800'
};

export default function EventList({ title, items, timeFormat = 'time', onStatusChange }: EventListProps) {
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
        {items.map((item) => (
          <div key={`${item.type}-${item.id}`} className="py-4 first:pt-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[item.type]}`}>
                    {item.type}
                  </span>
                  <h4 className="font-semibold text-gray-900">{item.title}</h4>
                  {item.status && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                      {item.status}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{item.subtitle}</p>
              </div>
              <span className="text-sm text-gray-500">
                {formatTime(item.datetime)}
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                {item.description}
              </p>
            </div>
            {item.type === 'event' && onStatusChange && item.status && (
              <div className="mt-2 flex justify-end gap-2">
                <select
                  value={item.status}
                  onChange={(e) => onStatusChange(item.id, e.target.value as EventStatus)}
                  className="text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="canceled">Canceled</option>
                  <option value="done">Done</option>
                </select>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}