import { memo, useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { CalendarEvent } from '../types';
import ActiveZoneCard from './ActiveZoneCard';
import Timeline from './Timeline';
import StreakCounter from './StreakCounter';
import AmbientSoundControl from './AmbientSoundControl';
import BreakReminder from './BreakReminder';

function parseEvents(events: CalendarEvent[]): CalendarEvent[] {
  return events.map(e => ({
    ...e,
    start: new Date(e.start),
    end: new Date(e.end),
  }));
}

export default function TodayView() {
  const {
    activeZone, zones, events, setEvents, suggestions, setSuggestions,
    streak, setStreak, focusScore, setFocusScore,
    notification,
  } = useAppStore();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const [evts, suggs, streakData, score] = await Promise.all([
        window.electronAPI.calendar.getEvents(today),
        window.electronAPI.stats.suggestions(),
        window.electronAPI.stats.streak(),
        window.electronAPI.stats.focusScore(),
      ]);

      setEvents(parseEvents(evts));
      setSuggestions(suggs);
      setStreak(streakData);
      setFocusScore(score);
    } catch (err) {
      console.error('Failed to load today data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Today</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <AmbientSoundControl />
          <StreakCounter streak={streak} />
        </div>
      </div>

      {/* Notification toast */}
      {notification && (
        <div className="animate-slide-up bg-primary-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
          <span className="text-lg">🔔</span>
          <div>
            <div className="font-medium text-sm">{notification.title}</div>
            <div className="text-xs text-primary-100">{notification.body}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Active Zone & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Zone Card */}
          <ActiveZoneCard />

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard
              label="Focus Score"
              value={`${focusScore.daily}`}
              sub={`Week: ${focusScore.weekly}`}
              color="text-primary-600"
              bg="bg-primary-50 dark:bg-primary-900/20"
            />
            <StatCard
              label="Today's Sessions"
              value={`${events.filter(e => !e.isAllDay).length}`}
              sub="meetings"
              color="text-amber-600"
              bg="bg-amber-50 dark:bg-amber-900/20"
            />
            <StatCard
              label="Streak"
              value={`${streak.currentStreak}`}
              sub={streak.currentStreak === 1 ? 'day' : 'days'}
              color="text-green-600"
              bg="bg-green-50 dark:bg-green-900/20"
            />
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Today&apos;s Schedule</h2>
            <Timeline events={events} />
          </div>
        </div>

        {/* Right column - Suggestions & Break */}
        <div className="space-y-6">
          <BreakReminder />

          {/* Quick Start Zone */}
          <div className="focus-card">
            <h3 className="font-semibold mb-3">Quick Start</h3>
            <div className="space-y-2">
              {zones.slice(0, 4).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => startZone(zone.id)}
                  disabled={activeZone !== null}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm"
                >
                  <div className="font-medium">{zone.name}</div>
                  <div className="text-xs text-gray-400">{zone.duration} min</div>
                </button>
              ))}
              {zones.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No zones yet. Create one in Settings.
                </p>
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="focus-card">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span>✨</span> Suggestions
              </h3>
              <div className="space-y-2">
                {suggestions.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800"
                  >
                    <div className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      {s.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {s.description}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-1 bg-purple-500 rounded-full" style={{ width: `${s.confidence * 100}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">
                        {Math.round(s.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const StatCard = memo(function StatCard({ label, value, sub, color, bg }: {
  label: string; value: string; sub: string; color: string; bg: string;
}) {
  return (
    <div className={`focus-card ${bg}`}>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
});

async function startZone(zoneId: string) {
  try {
    await window.electronAPI.zone.start(zoneId);
  } catch (err) {
    console.error('Failed to start zone:', err);
  }
}
