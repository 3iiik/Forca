import { memo, useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { CalendarEvent } from '../types';

export default function CalendarView() {
  const { events, setEvents } = useAppStore();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [icalUrl, setIcalUrl] = useState('');

  useEffect(() => {
    loadEvents();
  }, [selectedDate]);

  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const evts = await window.electronAPI.calendar.getEvents(selectedDate);
      setEvents(evts);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to load events:', err);
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
        <h1 className="text-2xl font-bold">Calendar</h1>
        {!isConnected && (
          <button onClick={handleAuth} className="btn-primary text-sm">
            Connect Calendar
          </button>
        )}
      </div>

      {/* Date navigator */}
      <div className="flex items-center justify-between focus-card">
        <button onClick={() => navigateDay(-1)} className="btn-ghost">
          ← Previous
        </button>
        <div className="text-center">
          <div className="font-semibold">
            {new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </div>
          {selectedDate === today && (
            <span className="text-xs text-primary-500 font-medium">Today</span>
          )}
        </div>
        <button onClick={() => navigateDay(1)} className="btn-ghost">
          Next →
        </button>
      </div>

      {/* Events list */}
      <div className="focus-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-sm text-gray-400">No events for this day</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      {/* iCal URL input */}
      <div className="focus-card">
        <h3 className="font-semibold mb-2">iCal Calendar</h3>
        <p className="text-xs text-gray-400 mb-3">
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
          className={`w-2.5 h-2.5 rounded-full ${
            isOngoing ? 'bg-focus-green animate-pulse' : 'bg-primary-400'
          }`}
        />
        <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 mt-1" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{event.title}</div>
        <div className="text-xs text-gray-400 mt-0.5">
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
      <div className="text-xs text-gray-400 capitalize">{event.source}</div>
    </div>
  );
});
