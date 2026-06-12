import { memo, useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { useAppStore } from '../stores/appStore';
import { FocusSession } from '../types';
import { logger } from '../utils/logger';

export default function StatsPage() {
  const { focusScore, setFocusScore, weeklySummary, setWeeklySummary, streak } = useAppStore();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStats = async () => {
    try {
      const [score, summary, allSessions] = await Promise.all([
        window.electronAPI.stats.focusScore(),
        window.electronAPI.stats.weeklySummary(),
        window.electronAPI.sessions.all(),
      ]);
      setFocusScore(score);
      setWeeklySummary(summary);
      setSessions(allSessions);
    } catch (err) {
      logger.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const dailyDeepWork = last7Days.map((date) => {
    const daySessions = sessions.filter((s) => s.date === date);
    const totalMinutes = daySessions.reduce((a, s) => a + s.durationCompleted, 0);
    const avgScore = daySessions.length > 0
      ? Math.round(daySessions.reduce((a, s) => a + s.score, 0) / daySessions.length)
      : 0;

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    return {
      day: dayName,
      hours: Math.round((totalMinutes / 60) * 10) / 10,
      score: avgScore,
      sessions: daySessions.length,
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Stats</h1>
        <button onClick={loadStats} className="btn-ghost text-xs">
          ↻ Refresh
        </button>
      </div>

      {/* Focus Score Cards */}
      <div className="grid grid-cols-4 gap-4">
        <ScoreCard label="Session" value={focusScore.session} />
        <ScoreCard label="Daily" value={focusScore.daily} />
        <ScoreCard label="Weekly" value={focusScore.weekly} />
        <ScoreCard label="Monthly" value={focusScore.monthly} />
      </div>

      {/* Weekly Summary */}
      {weeklySummary && (
        <div className="focus-card">
          <h2 className="text-sm font-semibold text-zinc-200 mb-4">Weekly Summary</h2>
          <div className="grid grid-cols-4 gap-4">
            <SummaryItem label="Deep Work Hours" value={`${weeklySummary.totalDeepWorkHours}h`} />
            <SummaryItem label="Best Day" value={weeklySummary.mostProductiveDay} />
            <SummaryItem label="Avg Zone Length" value={`${weeklySummary.averageZoneLength}m`} />
            <SummaryItem label="Best Score" value={weeklySummary.bestScore.toString()} />
          </div>
        </div>
      )}

      {/* Daily Deep Work Chart */}
      <div className="focus-card">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4">Daily Deep Work</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyDeepWork}>
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#a1a1aa' }} />
              <YAxis tick={{ fontSize: 12, fill: '#a1a1aa' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  fontSize: '12px',
                  color: '#e4e4e7',
                }}
              />
              <Bar dataKey="hours" fill="#5b21b6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Focus Score Trend */}
      <div className="focus-card">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4">Focus Score Trend</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyDeepWork}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#a1a1aa' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#a1a1aa' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #27272a',
                  fontSize: '12px',
                  color: '#e4e4e7',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={{ fill: '#7c3aed', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestones */}
      {sessions.length > 0 && (
        <div className="focus-card">
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">🏆 Milestones</h2>
          <div className="grid grid-cols-3 gap-3">
            <MilestoneCard
              title="Total Sessions"
              value={sessions.length.toString()}
              icon="🎯"
              unlocked={sessions.length >= 10}
            />
            <MilestoneCard
              title="Deep Work Hours"
              value={Math.round(sessions.reduce((a, s) => a + s.durationCompleted, 0) / 60).toString()}
              icon="⏱"
              unlocked={true}
            />
            <MilestoneCard
              title="Streak"
              value={`${streak.currentStreak} days`}
              icon="🔥"
              unlocked={streak.currentStreak >= 3}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const ScoreCard = memo(function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'text-green-400' : value >= 50 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="focus-card text-center">
      <div className="text-[11px] text-zinc-500 mb-1">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value}</div>
    </div>
  );
});

const SummaryItem = memo(function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-primary-400">{value}</div>
      <div className="text-[11px] text-zinc-500 mt-1">{label}</div>
    </div>
  );
});

const MilestoneCard = memo(function MilestoneCard({ title, value, icon, unlocked }: {
  title: string; value: string; icon: string; unlocked: boolean;
}) {
  return (
    <div className={`p-3 text-center border ${unlocked ? 'border-primary-800 bg-primary-900/10' : 'border-zinc-800 bg-zinc-900/50 opacity-50'}`}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="font-semibold text-sm text-zinc-200">{value}</div>
      <div className="text-[11px] text-zinc-500">{title}</div>
    </div>
  );
});
