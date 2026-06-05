import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { AppSettings, FocusZone } from '../types';

export default function SettingsPage() {
  const { settings, setSettings, zones, setZones } = useAppStore();
  const [activeTab, setActiveTab] = useState<'general' | 'calendar' | 'zones' | 'notifications' | 'sounds' | 'sync'>('general');
  const [newZone, setNewZone] = useState({ name: '', duration: 25 });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [s, z] = await Promise.all([
        window.electronAPI.settings.get(),
        window.electronAPI.zone.list(),
      ]);
      setSettings(s);
      setZones(z);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    if (!settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await window.electronAPI.settings.set(updated);
  };

  const updateNestedSetting = async (
    parent: keyof AppSettings,
    key: string,
    value: any
  ) => {
    if (!settings) return;
    const updated = {
      ...settings,
      [parent]: { ...(settings[parent] as any), [key]: value },
    };
    setSettings(updated);
    await window.electronAPI.settings.set(updated);
  };

  const createZone = async () => {
    if (!newZone.name.trim()) return;
    const zone: FocusZone = {
      id: crypto.randomUUID(),
      name: newZone.name,
      duration: newZone.duration,
      blockedApps: [],
      allowedApps: [],
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
  ] as const;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-1 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="focus-card">
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h2 className="font-semibold">General Settings</h2>

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
              <label className="text-sm font-medium block mb-1">Appearance</label>
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
            <h2 className="font-semibold">Calendar Integration</h2>

            <div>
              <label className="text-sm font-medium block mb-1">Provider</label>
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
                <p className="text-xs text-gray-400 mb-2">
                  Connect your Google Calendar to auto-detect meetings and trigger zones.
                </p>
                <button
                  onClick={async () => {
                    await window.electronAPI.calendar.auth();
                  }}
                  className="btn-primary"
                >
                  Connect Google Calendar
                </button>
              </div>
            )}

            {settings.calendar.provider === 'ical' && (
              <div>
                <label className="text-sm font-medium block mb-1">iCal URL</label>
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
            <h2 className="font-semibold">Forca</h2>

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
              <button onClick={createZone} className="btn-primary">
                Add Zone
              </button>
            </div>

            {/* Zone list */}
            <div className="space-y-2">
              {zones.length === 0 ? (
                <p className="text-sm text-gray-400 py-2">
                  No zones yet. Create your first zone above.
                </p>
              ) : (
                zones.map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{zone.name}</div>
                      <div className="text-xs text-gray-400">{zone.duration} min · {zone.trigger.type}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await window.electronAPI.zone.start(zone.id);
                        }}
                        className="btn-ghost text-xs"
                      >
                        ▶ Start
                      </button>
                      <button
                        onClick={async () => {
                          await window.electronAPI.zone.delete(zone.id);
                          loadSettings();
                        }}
                        className="btn-ghost text-xs text-red-400"
                      >
                        ✕
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
            <h2 className="font-semibold">Notification Preferences</h2>

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
            <h2 className="font-semibold">Sound Settings</h2>

            <ToggleSetting
              label="Ambient sounds"
              description="Play background sounds during Forca zones"
              checked={settings.sounds.enabled}
              onChange={(v) => updateNestedSetting('sounds', 'enabled', v)}
            />

            <div>
              <label className="text-sm font-medium block mb-1">Default Sound</label>
              <select
                value={settings.sounds.defaultSound}
                onChange={(e) => updateNestedSetting('sounds', 'defaultSound', e.target.value)}
                className="input-field"
              >
                <option value="none">None</option>
                <option value="rain">Rain</option>
                <option value="white-noise">White Noise</option>
                <option value="lofi">Lo-fi</option>
                <option value="forest">Forest</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Default Volume: {settings.sounds.defaultVolume}%
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={settings.sounds.defaultVolume}
                onChange={(e) => updateNestedSetting('sounds', 'defaultVolume', parseInt(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">
                Fade-out duration: {settings.sounds.fadeOutDuration}s
              </label>
              <input
                type="range"
                min={1}
                max={10}
                value={settings.sounds.fadeOutDuration}
                onChange={(e) => updateNestedSetting('sounds', 'fadeOutDuration', parseInt(e.target.value))}
                className="w-full accent-primary-500"
              />
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-4">
            <h2 className="font-semibold">Multi-Device Sync</h2>

            <ToggleSetting
              label="Enable sync"
              description="Sync settings and stats across devices"
              checked={settings.sync.enabled}
              onChange={(v) => updateNestedSetting('sync', 'enabled', v)}
            />

            {settings.sync.enabled && (
              <>
                <div>
                  <label className="text-sm font-medium block mb-1">Provider</label>
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

                <div className="text-xs text-gray-400">
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

function ToggleSetting({ label, description, checked, onChange }: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {description && <div className="text-xs text-gray-400">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-4' : ''
          }`}
        />
      </button>
    </div>
  );
}
