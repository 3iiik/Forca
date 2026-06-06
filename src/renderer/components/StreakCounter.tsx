import { memo } from 'react';
import { StreakData } from '../types';

interface StreakCounterProps {
  streak: StreakData;
}

const StreakCounter = memo(function StreakCounter({ streak }: StreakCounterProps) {
  if (streak.currentStreak === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-full border border-orange-200 dark:border-orange-800">
      <span className="text-lg">🔥</span>
      <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
        {streak.currentStreak}
      </span>
      <span className="text-xs text-orange-500">
        {streak.currentStreak === 1 ? 'day' : 'day streak'}
      </span>
      {!streak.todayCompleted && (
        <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" title="Complete today's session!" />
      )}
    </div>
  );
});

export default StreakCounter;
