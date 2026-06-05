import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';

export default function BreakReminder() {
  const { settings, breakTimer } = useAppStore();
  const [focusMinutes, setFocusMinutes] = useState(0);

  // Track how long the user has been in focus mode
  useEffect(() => {
    if (!breakTimer.isBreak) {
      const interval = setInterval(() => {
        setFocusMinutes(prev => prev + 1);
      }, 60000);
      return () => clearInterval(interval);
    } else {
      setFocusMinutes(0);
    }
  }, [breakTimer.isBreak]);

  if (!settings?.breakReminder.enabled) return null;

  const focusLimit = settings.breakReminder.focusDuration;
  const progress = focusLimit > 0 ? Math.min(focusMinutes / focusLimit, 1) : 0;
  const isDue = focusMinutes >= focusLimit && !breakTimer.isBreak;

  return (
    <div className={`focus-card ${isDue ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
      <h3 className="font-semibold flex items-center gap-2 mb-3">
        <span>⏰</span> Break Reminder
      </h3>

      {breakTimer.isBreak ? (
        <div className="text-center py-2">
          <div className="text-lg font-bold text-amber-600">
            {Math.floor(breakTimer.remaining / 60)}:{(breakTimer.remaining % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-xs text-gray-400">break remaining</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Focus time</span>
            <span className="font-medium">
              {focusMinutes}m / {focusLimit}m
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress >= 1 ? 'bg-amber-500' : 'bg-primary-500'
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          {isDue && (
            <div className="mt-3 text-center">
              <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">
                Time for a break! You've been focused for {focusMinutes} minutes.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
