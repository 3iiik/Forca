import { memo } from 'react';
import { CalendarEvent } from '../types';

interface TimelineProps {
  events: CalendarEvent[];
}

const Timeline = memo(function Timeline({ events }: TimelineProps) {
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
            className="absolute left-0 right-0 border-t border-zinc-800"
            style={{ top: `${(hour - 6) * 60}px` }}
          >
            <span className="text-[11px] text-zinc-500 absolute -top-3 -left-2 w-12 text-right">
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
              <div className="w-1.5 h-1.5 bg-primary-600" />
              <div className="flex-1 h-px bg-primary-600" />
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
                  className={`absolute left-0 right-2 p-2 border-l-2 transition-all ${
                    ongoing
                      ? 'bg-primary-900/20 border-primary-600'
                      : past
                      ? 'bg-zinc-900/50 border-zinc-700 opacity-50'
                      : 'bg-zinc-900/80 border-zinc-700'
                  }`}
                  style={{ top: `${pos.top}px`, height: `${pos.height}px`, minHeight: '24px' }}
                >
                  <div className="text-xs font-medium text-zinc-300 truncate">{event.title}</div>
                  <div className="text-[11px] text-zinc-500">
                    {event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    {' - '}
                    {event.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>
              );
            })}

          {events.filter(e => !e.isAllDay).length === 0 && (
            <div className="text-center py-8 text-xs text-zinc-500">
              No events scheduled today
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default Timeline;
