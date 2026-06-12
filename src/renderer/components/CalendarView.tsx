import { memo, useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { CalendarEvent } from '../types';
import { logger } from '../utils/logger';

function parseEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.map(e => ({
    ...e,
    start: new Date(e.start),
    end: new Date(e.end),
  }));
}

export default function CalendarView() {
  const { events, setEvents } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [icalUrl, setIcalUrl] = useState('');

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const evts = await window.electronAPI.calendar.getEvents(selectedDate);
      setEvents(parseEvents(evts));
      setIsConnected(true);
    } catch (err) {
      logger.error('Failed to load events:', err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuth = async () => {
    const result = await window.electronAPI.calendar.auth();
    if (result) {
      loadEvents();
    }
  };

  const navigateDay = (offset: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + offset);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Calendar</h1>
        {!isConnected && (
          <button onClick={handleAuth} className="btn-primary text-sm">
            Connect Calendar
          </button>
        )}
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-between focus-card">
        <button onClick={() => navigateDay(-1)} className="btn-ghost text-xs">
          ← Previous
        </button>
        <div className="text-center">
          <div className="text-sm font-semibold text-zinc-200">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </div>
          {selectedDate === today && (
            <span className="text-[11px] text-primary-400 font-medium">Today</span>
          )}
        </div>
        <button onClick={() => navigateDay(1)} className="btn-ghost text-xs">
          Next →
        </button>
      </div>

      {/* Events list */}
      <div className="focus-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border border-primary-600 border-t-transparent animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-xs text-zinc-500">No events for this day</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* iCal URL input */}
      <div className="focus-card">
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">iCal Calendar</h3>
        <p className="text-xs text-zinc-500 mb-3">
          Paste your iCal URL to sync public calendars
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={icalUrl}
            onChange={(e) => setIcalUrl(e.target.value)}
            placeholder="https://calendar.google.com/.../basic.ics"
            className="input-field flex-1"
          />
          <button
            onClick={async () => {
              if (icalUrl.trim()) {
                const settings = await window.electronAPI.settings.get();
                settings.calendar.icalUrl = icalUrl.trim();
                settings.calendar.provider = 'ical';
                await window.electronAPI.settings.set(settings);
                setIsConnected(true);
                loadEvents();
              }
            }}
            className="btn-primary text-sm"
          >Connect</button>
        </div>
      </div>
    </div>
  );
}

const EventRow = memo(function EventRow({ event }: { event: CalendarEvent }) {
  const isPast = new Date() > event.end;
  const isOngoing = new Date() >= event.start && new Date() <= event.end;

  return (
    <div className={`py-3 flex items-start gap-3 ${isPast ? 'opacity-40' : ''}`}>
      <div className="flex flex-col items-center mt-1">
        <div
          className={`w-2 h-2 rounded-full ${
            isOngoing ? 'bg-focus-green animate-pulse' : 'bg-primary-600'
          }`}
        />
        <div className="w-px h-full bg-zinc-800 mt-1" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-zinc-300 truncate">{event.title}</div>
        <div className="text-[11px] text-zinc-500 mt-0.5">
          {event.isAllDay ? (
            'All day'
          ) : (
            <>
              {event.start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              {' — '}
              {event.end.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </>
          )}
        </div>
      </div>
      <div className="text-[11px] text-zinc-500 capitalize">{event.source}</div>
    </div>
  );
});
