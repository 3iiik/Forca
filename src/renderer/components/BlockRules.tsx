import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../stores/appStore';

export default function BlockRules() {
  const { zones, setZones } = useAppStore();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [newApp, setNewApp] = useState('');
  const [newSite, setNewSite] = useState('');
  const [allowedApps, setAllowedApps] = useState<string[]>([]);
  const [newAllowedApp, setNewAllowedApp] = useState('');

  useEffect(() => {
    loadZones();
    loadAllowedApps();
  }, []);

  useEffect(() => {
    if (zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones, selectedZoneId]);

  const loadZones = async () => {
    const z = await window.electronAPI.zone.list();
    setZones(z);
  };

  const loadAllowedApps = async () => {
    const apps = await window.electronAPI.blocker.getAllowedApps();
    setAllowedApps(apps);
  };

  const selectedZone = zones.find(z => z.id === selectedZoneId) || zones[0];

  const updateZone = async (update: Partial<typeof selectedZone>) => {
    if (!selectedZone) return;
    const updated = { ...selectedZone, ...update };
    await window.electronAPI.zone.update(updated);
    await loadZones();
  };

  const handleAddAllowedApp = useCallback(async () => {
    if (newAllowedApp.trim()) {
      const updated = [...allowedApps, newAllowedApp.trim()];
      await window.electronAPI.blocker.setAllowedApps(updated);
      setAllowedApps(updated);
      setNewAllowedApp('');
    }
  }, [newAllowedApp, allowedApps]);

  const handleRemoveAllowedApp = useCallback(async (app: string) => {
    const updated = allowedApps.filter(a => a !== app);
    await window.electronAPI.blocker.setAllowedApps(updated);
    setAllowedApps(updated);
  }, [allowedApps]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Block Rules</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Configure which apps and websites are blocked during Forca zones.
      </p>

      {/* Zone selector */}
      {zones.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Zone:</label>
          <select
            value={selectedZoneId}
            onChange={(e) => setSelectedZoneId(e.target.value)}
            className="input-field w-auto"
          >
            {zones.map(z => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>
      )}

      {!selectedZone ? (
        <div className="focus-card text-center py-8">
          <p className="text-sm text-gray-400">No zones configured. Create one in Settings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blocked Apps */}
          <div className="focus-card">
            <h2 className="font-semibold mb-3">Blocked Apps — {selectedZone.name}</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newApp}
                onChange={(e) => setNewApp(e.target.value)}
                placeholder="e.g. discord, slack, chrome"
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={async () => {
                  if (newApp.trim() && selectedZone) {
                    const apps = newApp.split(',').map(a => a.trim()).filter(Boolean);
                    await updateZone({ blockedApps: [...selectedZone.blockedApps, ...apps] });
                    setNewApp('');
                  }
                }}
                className="btn-primary text-sm"
              >
                Add
              </button>
            </div>
            <div className="text-xs text-gray-400 mb-3">
              Enter process names (without .exe), separated by commas
            </div>
            <div className="space-y-2">
              {selectedZone.blockedApps.length > 0 ? (
                selectedZone.blockedApps.map((app, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                    <span>{app}</span>
                    <button
                      onClick={async () => {
                        if (selectedZone) {
                          await updateZone({ blockedApps: selectedZone.blockedApps.filter(a => a !== app) });
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >✕</button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 py-2">No blocked apps configured</p>
              )}
            </div>
          </div>

          {/* Blocked Sites */}
          <div className="focus-card">
            <h2 className="font-semibold mb-3">Blocked Websites — {selectedZone.name}</h2>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newSite}
                onChange={(e) => setNewSite(e.target.value)}
                placeholder="e.g. reddit.com, twitter.com"
                className="input-field flex-1 text-sm"
              />
              <button
                onClick={async () => {
                  if (newSite.trim() && selectedZone) {
                    const sites = newSite.split(',').map(s => s.trim()).filter(Boolean);
                    await updateZone({ blockedSites: [...selectedZone.blockedSites, ...sites] });
                    setNewSite('');
                  }
                }}
                className="btn-primary text-sm"
              >Add</button>
            </div>
            <div className="text-xs text-gray-400 mb-3">
              Sites will be blocked via /etc/hosts during Forca zones
            </div>
            <div className="space-y-2">
              {selectedZone.blockedSites.length > 0 ? (
                selectedZone.blockedSites.map((site, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                    <span>{site}</span>
                    <button
                      onClick={async () => {
                        if (selectedZone) {
                          await updateZone({ blockedSites: selectedZone.blockedSites.filter(s => s !== site) });
                        }
                      }}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >✕</button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 py-2">No blocked sites configured</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Allow list */}
      <div className="focus-card">
        <h2 className="font-semibold mb-3">Always-Allowed Apps</h2>
        <p className="text-xs text-gray-400 mb-3">
          These apps will never be blocked, even during Forca zones.
        </p>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newAllowedApp}
            onChange={(e) => setNewAllowedApp(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddAllowedApp(); }}
            placeholder="e.g. Slack, Spotify"
            className="input-field flex-1 text-sm"
          />
          <button
            onClick={handleAddAllowedApp}
            className="btn-primary text-sm"
          >Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allowedApps.length > 0 ? (
            allowedApps.map((app) => (
              <span
                key={app}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-800"
              >
                {app}
                <button
                  onClick={() => handleRemoveAllowedApp(app)}
                  className="text-green-400 hover:text-red-500 ml-1"
                >✕</button>
              </span>
            ))
          ) : (
            <p className="text-xs text-gray-400">No always-allowed apps configured.</p>
          )}
        </div>
      </div>
    </div>
  );
}
