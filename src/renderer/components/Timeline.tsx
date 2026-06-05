import { CalendarEvent } from '../types';

interface TimelineProps {
  events: CalendarEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  const now = new Date();
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 10 PM

  const getEventPosition = (event: CalendarEvent) => {
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    const top = (startHour - 6) * 60;
    const height = Math.max((endHour - startHour) * 60, 20);
    return { top, height };
  };

  const isOngoing = (event: CalendarEvent) => {
    return now >= event.start && now <= event.end;
  };

  const isPast = (event: CalendarEvent) => {
    return now > event.end;
  };

  return (
    <div className="focus-card p-0 overflow-hidden">
      <div className="relative p-4" style={{ height: `${hours.length * 60}px` }}>
        {/* Hour lines */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="absolute left-0 right-0 border-t border-gray-100 dark:border-gray-800"
            style={{ top: `${(hour - 6) * 60}px` }}
          >
            <span className="text-xs text-gray-400 absolute -top-3 -left-2 w-12 text-right">
              {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
            </span>
          </div>
        ))}

        {/* Current time indicator */}
        {now.getHours() >= 6 && now.getHours() < 22 && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{ top: `${(now.getHours() - 6 + now.getMinutes() / 60) * 60}px` }}
          >
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-primary-500" />
              <div className="flex-1 h-0.5 bg-primary-500" />
            </div>
          </div>
        )}

        {/* Events */}
        <div className="ml-14 relative">
          {events
            .filter(e => !e.isAllDay)
            .map((event) => {
              const pos = getEventPosition(event);
              const ongoing = isOngoing(event);
              const past = isPast(event);

              return (
                <div
                  key={event.id}
                  className={`absolute left-0 right-2 p-2 rounded-lg border-l-4 transition-all ${
                    ongoing
                      ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500'
                      : past
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 opacity-50'
                      : 'bg-white dark:bg-gray-800 border-primary-300 dark:border-primary-700 hover:shadow-sm'
                  }`}
                  style={{ top: `${pos.top}px`, height: `${pos.height}px`, minHeight: '24px' }}
                >
                  <div className="text-xs font-medium truncate">{event.title}</div>
                  <div className="text-xs text-gray-400">
                    {event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    {' - '}
                    {event.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}

          {events.filter(e => !e.isAllDay).length === 0 && (
            <div className="text-center py-8 text-sm text-gray-400">
              No events scheduled today
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
