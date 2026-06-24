import { memo, useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { CalendarEvent } from '../types';
import ActiveZoneCard from './ActiveZoneCard';
import Timeline from './Timeline';
import StreakCounter from './StreakCounter';
import AmbientSoundControl from './AmbientSoundControl';
import BreakReminder from './BreakReminder';
import { logger } from '../utils/logger';
import { Bell, Sparkles } from 'lucide-react';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      logger.error('Failed to load today data:', err);
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
          <h1 className="text-xl font-bold text-zinc-100">Today</h1>
          <p className="text-xs text-zinc-500 mt-1">
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
        <div className="animate-slide-up bg-primary-900 text-zinc-100 px-4 py-3 flex items-center gap-3 border border-zinc-800">
          <Bell className="w-4 h-4 shrink-0" />
          <div>
            <div className="font-medium text-sm">{notification.title}</div>
            <div className="text-xs text-zinc-400">{notification.body}</div>
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
              color="text-primary-400"
            />
            <StatCard
              label="Today's Sessions"
              value={`${events.filter(e => !e.isAllDay).length}`}
              sub="meetings"
              color="text-amber-400"
            />
            <StatCard
              label="Streak"
              value={`${streak.currentStreak}`}
              sub={streak.currentStreak === 1 ? 'day' : 'days'}
              color="text-green-400"
            />
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-sm font-semibold text-zinc-200 mb-3">Today&apos;s Schedule</h2>
            <Timeline events={events} />
          </div>
        </div>

        {/* Right column - Suggestions & Break */}
        <div className="space-y-6">
          <BreakReminder />

          {/* Quick Start Zone */}
          <div className="focus-card">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">Quick Start</h3>
            <div className="space-y-1">
              {zones.slice(0, 4).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => startZone(zone.id)}
                  disabled={activeZone !== null}
                  className="w-full text-left px-3 py-1.5 hover:bg-zinc-800/50 transition-colors text-sm"
                >
                  <div className="text-sm text-zinc-300">{zone.name}</div>
                  <div className="text-[11px] text-zinc-500">{zone.duration} min</div>
                </button>
              ))}
              {zones.length === 0 && (
                <p className="text-xs text-zinc-500 text-center py-4">
                  No zones yet. Create one in Settings.
                </p>
              )}
            </div>
          </div>

          {/* AI Suggestions */}
          {suggestions.length > 0 && (
            <div className="focus-card">
              <h3 className="text-sm font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary-400" /> Suggestions
              </h3>
              <div className="space-y-2">
                {suggestions.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="p-2 border border-zinc-800 bg-zinc-900/50"
                  >
                    <div className="text-xs font-medium text-zinc-200">
                      {s.title}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {s.description}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-zinc-800">
                        <div className="h-1 bg-primary-700" style={{ width: `${s.confidence * 100}%` }} />
                      </div>
                      <span className="text-[11px] text-zinc-500">
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

const StatCard = memo(function StatCard({ label, value, sub, color }: {
  label: string; value: string; sub: string; color: string;
}) {
  return (
    <div className="focus-card">
      <div className="text-[11px] text-zinc-500 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      <div className="text-[11px] text-zinc-500 mt-0.5">{sub}</div>
    </div>
  );
});

async function startZone(zoneId: string) {
  try {
    await window.electronAPI.zone.start(zoneId);
  } catch (err) {
    logger.error('Failed to start zone:', err);
  }
}
