import { memo, useEffect, useRef, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { AppSettings, FocusZone } from '../types';
import { logger } from '../utils/logger';
import { Play, X } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';

export default function SettingsPage() {
  const { settings, setSettings, zones, setZones } = useAppStore();
  const [activeTab, setActiveTab] = useState<'general' | 'calendar' | 'zones' | 'notifications' | 'sounds' | 'sync' | 'analytics'>('general');
  const [funnel, setFunnel] = useState<Array<{ label: string; count: number; conversion: number | null; dropOff: number | null }> | null>(null);
  const [newZone, setNewZone] = useState({ name: '', duration: 25 });
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<AppSettings | null>(null);

  useEffect(() => {
    loadSettings();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (pendingRef.current) window.electronAPI.settings.set(pendingRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      window.electronAPI.analytics.getFunnel().then(setFunnel);
    }
  }, [activeTab]);

  const loadSettings = async () => {
    try {
      const [s, z] = await Promise.all([
        window.electronAPI.settings.get(),
        window.electronAPI.zone.list(),
      ]);
      setSettings(s);
      setZones(z);
    } catch (err) {
      logger.error('Failed to load settings:', err);
    }
  };

  const updateNestedSetting = (
    parent: keyof AppSettings,
    key: string,
    value: unknown
  ) => {
    if (!settings) return;
    const updated = {
      ...settings,
      [parent]: { ...(settings[parent] as unknown as Record<string, unknown>), [key]: value },
    };
    setSettings(updated);
    pendingRef.current = updated;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      await window.electronAPI.settings.set(updated);
      pendingRef.current = null;
    }, 500);
  };

  const createZone = async () => {
    if (!newZone.name.trim()) return;
    const zone: FocusZone = {
      id: crypto.randomUUID(),
      name: newZone.name,
      duration: newZone.duration,
      blockedSites: [],
      trigger: { type: 'manual' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const created = await window.electronAPI.zone.create(zone);
    setZones([...zones, created]);
    setNewZone({ name: '', duration: 25 });
  };

  if (!settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'zones', label: 'Zones' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'sounds', label: 'Sounds' },
    { id: 'sync', label: 'Sync' },
    { id: 'analytics', label: 'Analytics' },
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-zinc-100 border-b-2 border-primary-700'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="focus-card">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">General Settings</h2>

            <ToggleSetting
              label="Launch on system startup"
              description="Auto-start Forca when you log in"
              checked={settings.general.autoLaunch}
              onChange={(v) => updateNestedSetting('general', 'autoLaunch', v)}
            />
            <ToggleSetting
              label="Launch minimized"
              description="Start app in the system tray"
              checked={settings.general.launchMinimized}
              onChange={(v) => updateNestedSetting('general', 'launchMinimized', v)}
            />
            <ToggleSetting
              label="Minimize to tray"
              description="Minimize to system tray instead of taskbar"
              checked={settings.general.minimizeToTray}
              onChange={(v) => updateNestedSetting('general', 'minimizeToTray', v)}
            />
            <ToggleSetting
              label="Close to tray"
              description="Closing the window sends app to tray"
              checked={settings.general.closeToTray}
              onChange={(v) => updateNestedSetting('general', 'closeToTray', v)}
            />
            <ToggleSetting
              label="Sync Do Not Disturb"
              description="Auto-enable DND when zone starts"
              checked={settings.general.dndSync}
              onChange={(v) => updateNestedSetting('general', 'dndSync', v)}
            />

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Appearance</label>
              <select
                value={settings.general.darkMode}
                onChange={(e) => updateNestedSetting('general', 'darkMode', e.target.value)}
                className="input-field"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Calendar Integration</h2>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Provider</label>
              <select
                value={settings.calendar.provider}
                onChange={(e) => updateNestedSetting('calendar', 'provider', e.target.value)}
                className="input-field"
              >
                <option value="none">None</option>
                <option value="google">Google Calendar</option>
                <option value="ical">iCal URL</option>
              </select>
            </div>

            {settings.calendar.provider === 'google' && (
              <div>
                <p className="text-xs text-zinc-500 mb-2">
                  Connect your Google Calendar to auto-detect meetings and trigger zones.
                </p>
                <button
                  onClick={async () => {
                    await window.electronAPI.calendar.auth();
                  }}
                  className="btn-primary text-sm"
                >
                  Connect Google Calendar
                </button>
              </div>
            )}

            {settings.calendar.provider === 'ical' && (
              <div>
                <label className="text-xs text-zinc-400 block mb-1">iCal URL</label>
                <input
                  type="url"
                  value={settings.calendar.icalUrl}
                  onChange={(e) => updateNestedSetting('calendar', 'icalUrl', e.target.value)}
                  placeholder="https://..."
                  className="input-field"
                />
              </div>
            )}

            <ToggleSetting
              label="Auto-sync calendar"
              description="Periodically fetch calendar events"
              checked={settings.calendar.syncEnabled}
              onChange={(v) => updateNestedSetting('calendar', 'syncEnabled', v)}
            />
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Forca</h2>

            {/* Create zone */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newZone.name}
                onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
                placeholder="Zone name (e.g. Deep Work)"
                className="input-field flex-1"
              />
              <input
                type="number"
                value={newZone.duration}
                onChange={(e) => setNewZone({ ...newZone, duration: parseInt(e.target.value) || 25 })}
                className="input-field w-20"
                min={5}
                max={240}
              />
              <button onClick={createZone} className="btn-primary text-sm">
                Add Zone
              </button>
            </div>

            {/* Zone list */}
            <div className="space-y-1">
              {zones.length === 0 ? (
                <p className="text-xs text-zinc-500 py-2">
                  No zones yet. Create your first zone above.
                </p>
              ) : (
                zones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between px-3 py-2 border border-zinc-800 bg-zinc-900/50">
                    <div>
                      <div className="text-sm text-zinc-300">{zone.name}</div>
                      <div className="text-[11px] text-zinc-500">{zone.duration} min · {zone.trigger.type}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await window.electronAPI.zone.start(zone.id);
                        }}
                        className="btn-ghost text-xs"
                      >
                        <Play className="w-3 h-3" /> Start
                      </button>
                      <button
                        onClick={async () => {
                          await window.electronAPI.zone.delete(zone.id);
                          loadSettings();
                        }}
                        className="btn-ghost text-xs text-zinc-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Notification Preferences</h2>

            <ToggleSetting
              label="Zone started"
              checked={settings.notifications.zoneStart}
              onChange={(v) => updateNestedSetting('notifications', 'zoneStart', v)}
            />
            <ToggleSetting
              label="Zone ended"
              checked={settings.notifications.zoneEnd}
              onChange={(v) => updateNestedSetting('notifications', 'zoneEnd', v)}
            />
            <ToggleSetting
              label="Meeting soon"
              checked={settings.notifications.meetingSoon}
              onChange={(v) => updateNestedSetting('notifications', 'meetingSoon', v)}
            />
            <ToggleSetting
              label="Break reminders"
              checked={settings.notifications.breakReminder}
              onChange={(v) => updateNestedSetting('notifications', 'breakReminder', v)}
            />
            <ToggleSetting
              label="Streak at risk"
              checked={settings.notifications.streakRisk}
              onChange={(v) => updateNestedSetting('notifications', 'streakRisk', v)}
            />
            <ToggleSetting
              label="Milestones"
              checked={settings.notifications.milestone}
              onChange={(v) => updateNestedSetting('notifications', 'milestone', v)}
            />
          </div>
        )}

        {activeTab === 'sounds' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Sound Settings</h2>

            <ToggleSetting
              label="Ambient sounds"
              description="Play background sounds during Forca zones"
              checked={settings.sounds.enabled}
              onChange={(v) => updateNestedSetting('sounds', 'enabled', v)}
            />

            <div>
              <label className="text-xs text-zinc-400 block mb-1">Default Sound</label>
              <select
                value={settings.sounds.defaultSound}
                onChange={(e) => updateNestedSetting('sounds', 'defaultSound', e.target.value)}
                className="input-field"
              >
                <option value="none">None</option>
                <option value="rain">Rain</option>
                <option value="white-noise">White Noise</option>
                <option value="forest">Forest</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Default Volume: {settings.sounds.defaultVolume}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.sounds.defaultVolume}
                onChange={(e) => updateNestedSetting('sounds', 'defaultVolume', parseInt(e.target.value))}
                className="w-full accent-primary-700"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-400 block mb-1">
                Fade-out duration: {settings.sounds.fadeOutDuration}s
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={settings.sounds.fadeOutDuration}
                onChange={(e) => updateNestedSetting('sounds', 'fadeOutDuration', parseInt(e.target.value))}
                className="w-full accent-primary-700"
              />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Onboarding Funnel</h2>

            {funnel === null && (
              <p className="text-xs text-zinc-500">Loading...</p>
            )}

            {funnel !== null && funnel.length === 0 && (
              <p className="text-xs text-zinc-500 py-3">Not enough data yet.</p>
            )}

            {funnel !== null && funnel.length > 0 && (
              <div className="space-y-3">
                {funnel.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-4 py-2 px-3 border border-zinc-800 bg-zinc-900/50 rounded-lg">
                    <div className="w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-zinc-800 text-zinc-400 rounded shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-zinc-200">{step.label}</div>
                      <div className="text-[11px] text-zinc-500">
                        {step.count} {step.count === 1 ? 'user' : 'users'}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {step.conversion !== null ? (
                        <>
                          <div className="text-sm font-medium text-zinc-200">{step.conversion}%</div>
                          <div className="text-[10px] text-red-400">-{step.dropOff}% drop-off</div>
                        </>
                      ) : (
                        <div className="text-sm font-medium text-zinc-400">baseline</div>
                      )}
                    </div>
                    <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden shrink-0">
                      {step.conversion !== null && (
                        <div
                          className="h-full bg-primary-700 rounded-full transition-all"
                          style={{ width: `${step.conversion}%` }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={async () => {
                const data = await window.electronAPI.analytics.getFunnel();
                setFunnel(data);
              }}
              className="btn-ghost text-xs"
            >
              Refresh
            </button>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200">Multi-Device Sync</h2>

            <ToggleSetting
              label="Enable sync"
              description="Sync settings and stats across devices"
              checked={settings.sync.enabled}
              onChange={(v) => updateNestedSetting('sync', 'enabled', v)}
            />

            {settings.sync.enabled && (
              <>
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Provider</label>
                  <select
                    value={settings.sync.provider}
                    onChange={(e) => updateNestedSetting('sync', 'provider', e.target.value)}
                    className="input-field"
                  >
                    <option value="none">None</option>
                    <option value="firebase">Firebase</option>
                    <option value="supabase">Supabase</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await window.electronAPI.sync.upload();
                      loadSettings();
                    }}
                    className="btn-primary text-sm"
                  >
                    Upload Now
                  </button>
                  <button
                    onClick={async () => {
                      await window.electronAPI.sync.download();
                      loadSettings();
                    }}
                    className="btn-secondary text-sm"
                  >
                    Download
                  </button>
                </div>

                <div className="text-[11px] text-zinc-500">
                  Last synced: {settings.sync.lastSynced || 'Never'}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const ToggleSetting = memo(function ToggleSetting({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="pr-3">
        <div className="text-sm text-zinc-200">{label}</div>
        {description && <div className="text-[11px] text-zinc-500 mt-0.5">{description}</div>}
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} />
    </div>
  );
});
