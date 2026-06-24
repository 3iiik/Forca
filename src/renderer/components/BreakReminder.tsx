import { memo, useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { Clock } from 'lucide-react';

const BreakReminder = memo(function BreakReminder() {
  const { settings, breakTimer, activeZone } = useAppStore();
  const [focusMinutes, setFocusMinutes] = useState(0);

  useEffect(() => {
    if (!breakTimer.isBreak && activeZone) {
      const interval = setInterval(() => {
        setFocusMinutes(Math.floor((Date.now() - new Date(activeZone.startTime).getTime()) / 60000));
      }, 10000);
      return () => clearInterval(interval);
    } else {
      setFocusMinutes(0);
    }
  }, [breakTimer.isBreak, activeZone]);

  if (!settings?.breakReminder.enabled) return null;

  const focusLimit = settings.breakReminder.focusDuration;
  const progress = focusLimit > 0 ? Math.min(focusMinutes / focusLimit, 1) : 0;
  const isDue = focusMinutes >= focusLimit && !breakTimer.isBreak;

  return (
    <div className={`focus-card ${isDue ? 'border-amber-700 bg-zinc-900/80' : ''}`}>
      <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-amber-400" /> Break Reminder
      </h3>

      {breakTimer.isBreak ? (
        <div className="text-center py-2">
          <div className="text-lg font-bold text-amber-400">
            {Math.floor(breakTimer.remaining / 60)}:{(breakTimer.remaining % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-[11px] text-zinc-500">break remaining</div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-zinc-500">Focus time</span>
            <span className="text-zinc-300">
              {focusMinutes}m / {focusLimit}m
            </span>
          </div>
          <div className="h-1 bg-zinc-800">
            <div
              className={`h-full transition-all duration-500 ${
                progress >= 1 ? 'bg-amber-600' : 'bg-primary-800'
              }`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          {isDue && (
            <div className="mt-3 text-center">
              <p className="text-xs text-amber-400 mb-2">
                Time for a break! You&apos;ve been focused for {focusMinutes} minutes.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default BreakReminder;
