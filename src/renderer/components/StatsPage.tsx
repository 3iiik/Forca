import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { useAppStore } from '../stores/appStore';
import { FocusSession } from '../types';

export default function StatsPage() {
  const { focusScore, setFocusScore, weeklySummary, setWeeklySummary, streak } = useAppStore();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
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
      console.error('Failed to load stats:', err);
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
        <h1 className="text-2xl font-bold">Stats</h1>
        <button onClick={loadStats} className="btn-ghost text-sm">
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
          <h2 className="font-semibold mb-4">Weekly Summary</h2>
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
        <h2 className="font-semibold mb-4">Daily Deep Work</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyDeepWork}>
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="hours" fill="#3D2FA8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Focus Score Trend */}
      <div className="focus-card">
        <h2 className="font-semibold mb-4">Focus Score Trend</h2>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyDeepWork}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #fff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ fill: '#8b5cf6', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestones */}
      {sessions.length > 0 && (
        <div className="focus-card">
          <h2 className="font-semibold mb-3">🏆 Milestones</h2>
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

function ScoreCard({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'text-green-600' : value >= 50 ? 'text-amber-600' : 'text-red-600';
  return (
    <div className="focus-card text-center">
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-primary-600">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  );
}

function MilestoneCard({ title, value, icon, unlocked }: {
  title: string; value: string; icon: string; unlocked: boolean;
}) {
  return (
    <div className={`p-3 rounded-lg text-center ${unlocked ? 'bg-purple-50 dark:bg-purple-900/20' : 'bg-gray-50 dark:bg-gray-800/50 opacity-50'}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="font-bold text-sm">{value}</div>
      <div className="text-xs text-gray-400">{title}</div>
    </div>
  );
}
