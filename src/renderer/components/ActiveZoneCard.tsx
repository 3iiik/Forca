import { memo } from 'react';
import { useAppStore } from '../stores/appStore';
import { Zap, Coffee, X, Play, Pause } from 'lucide-react';

const ActiveZoneCard = memo(function ActiveZoneCard() {
  const { activeZone, breakTimer, zones, setCurrentView } = useAppStore();

  const handleStart = async () => {
    if (zones.length > 0) {
      await window.electronAPI.zone.start(zones[0].id);
    } else {
      setCurrentView('settings');
    }
  };

  const handlePause = async () => {
    if (!activeZone) return;
    if (activeZone.status === 'running') {
      await window.electronAPI.zone.pause();
    } else {
      await window.electronAPI.zone.resume();
    }
  };

  const handleStop = async () => {
    await window.electronAPI.zone.stop();
  };

  if (!activeZone && !breakTimer.isBreak) {
    return (
      <div className="focus-card text-center py-8">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary-900/20 border border-primary-800/40 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-400" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-zinc-200 mb-2">No Active Zone</h2>
        <p className="text-xs text-zinc-500 mb-4">
          Start a focus zone from the list or wait for an auto-trigger
        </p>
        <button
          onClick={handleStart}
          className="btn-primary"
        >
          {zones.length > 0 ? 'Start First Zone' : 'Create Your First Zone'}
        </button>
      </div>
    );
  }

  if (!activeZone) return null;

  if (breakTimer.isBreak) {
    const breakPct = breakTimer.total > 0
      ? ((breakTimer.total - breakTimer.remaining) / breakTimer.total) * 100
      : 0;

    return (
      <div className="focus-card text-center py-8 border-amber-700 bg-zinc-900/80">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-xl bg-amber-900/20 border border-amber-800/40 flex items-center justify-center">
            <Coffee className="w-6 h-6 text-amber-400" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-zinc-200 mb-1">Break Time</h2>
        <p className="text-xs text-zinc-500 mb-4">Take a moment to recharge</p>

        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="4"
                className="text-zinc-800" />
              <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - breakPct / 100)}`}
                className="text-amber-500 transition-all duration-500" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-amber-400">
                {Math.floor(breakTimer.remaining / 60)}:{(breakTimer.remaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          {Math.ceil(breakTimer.remaining / 60)} min remaining
        </p>
      </div>
    );
  }

  const totalDuration = Math.floor(
    (new Date(activeZone.endTime).getTime() - new Date(activeZone.startTime).getTime()) / 1000
  );
  const remaining = activeZone.remaining;
  const progress = totalDuration > 0 ? ((totalDuration - remaining) / totalDuration) * 100 : 0;
  const isPaused = activeZone.status === 'paused';

  return (
    <div className={`focus-card ${isPaused ? 'opacity-75' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-yellow-400' : 'bg-focus-green'} ${isPaused ? '' : 'animate-pulse'}`} />
          <div>
            <h2 className="text-lg font-semibold text-zinc-200">{activeZone.zoneName}</h2>
            <p className="text-[11px] text-zinc-500">
              {isPaused ? 'Paused' : 'Focus Mode Active'}
            </p>
          </div>
        </div>
        <button onClick={handleStop} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
          <X className="w-3 h-3" /> End
        </button>
      </div>

      {/* Countdown Ring */}
      <div className="flex items-center justify-center py-4">
        <div className="relative">
          <svg className="w-36 h-36 transform -rotate-90">
            <circle cx="72" cy="72" r="64" fill="none" stroke="currentColor" strokeWidth="6"
              className="text-zinc-800" />
            <circle cx="72" cy="72" r="64" fill="none" stroke="currentColor" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 64}`}
              strokeDashoffset={`${2 * Math.PI * 64 * (1 - progress / 100)}`}
              className="text-primary-600 transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold tracking-tight text-zinc-100">
              {Math.floor(remaining / 60).toString().padStart(2, '0')}
              <span className="text-2xl text-zinc-500">:</span>
              {(remaining % 60).toString().padStart(2, '0')}
            </span>
            <span className="text-xs text-zinc-500 mt-1">remaining</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-2">
        <button onClick={handlePause} className="btn-secondary px-6 text-xs flex items-center gap-1.5">
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </div>
    </div>
  );
});

export default ActiveZoneCard;
