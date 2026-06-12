import { memo } from 'react';
import { StreakData } from '../types';

interface StreakCounterProps {
  streak: StreakData;
}

const StreakCounter = memo(function StreakCounter({ streak }: StreakCounterProps) {
  if (streak.currentStreak === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 border border-zinc-800 bg-zinc-900/50">
      <span className="text-sm">🔥</span>
      <span className="text-xs font-semibold text-zinc-300">
        {streak.currentStreak}
      </span>
      <span className="text-[11px] text-zinc-500">
        {streak.currentStreak === 1 ? 'day' : 'days'}
      </span>
      {!streak.todayCompleted && (
        <span className="w-1 h-1 bg-zinc-500" title="Complete today's session!" />
      )}
    </div>
  );
});

export default StreakCounter;
