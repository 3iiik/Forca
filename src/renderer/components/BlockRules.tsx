import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { FocusZone } from '../types';

export default function BlockRules() {
  const { zones, setZones } = useAppStore();
  const [newApp, setNewApp] = useState('');
  const [newSite, setNewSite] = useState('');

  useEffect(() => {
    loadZones();
  }, []);

  const loadZones = async () => {
    const z = await window.electronAPI.zone.list();
    setZones(z);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Block Rules</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Configure which apps and websites are blocked during Forca zones.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blocked Apps */}
        <div className="focus-card">
          <h2 className="font-semibold mb-3">Blocked Apps</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newApp}
              onChange={(e) => setNewApp(e.target.value)}
              placeholder="e.g. discord, slack, chrome"
              className="input-field flex-1 text-sm"
            />
            <button
              onClick={() => {
                if (newApp.trim()) {
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
            {/* Show from first zone */}
            {zones.slice(0, 1).map((zone) => (
              <div key={zone.id}>
                <div className="text-xs font-medium text-gray-500 mb-2">
                  {zone.name} blocked apps:
                </div>
                {zone.blockedApps.length > 0 ? (
                  zone.blockedApps.map((app, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                      <span>{app}</span>
                      <button className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-2">No blocked apps configured</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Blocked Sites */}
        <div className="focus-card">
          <h2 className="font-semibold mb-3">Blocked Websites</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="e.g. reddit.com, twitter.com"
              className="input-field flex-1 text-sm"
            />
            <button className="btn-primary text-sm">Add</button>
          </div>
          <div className="text-xs text-gray-400 mb-3">
            Sites will be blocked via /etc/hosts during Forca zones
          </div>
          <div className="space-y-2">
            {zones.slice(0, 1).map((zone) => (
              <div key={zone.id}>
                <div className="text-xs font-medium text-gray-500 mb-2">
                  {zone.name} blocked sites:
                </div>
                {zone.blockedSites.length > 0 ? (
                  zone.blockedSites.map((site, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm">
                      <span>{site}</span>
                      <button className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 py-2">No blocked sites configured</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Allow list */}
      <div className="focus-card">
        <h2 className="font-semibold mb-3">Always-Allowed Apps</h2>
        <p className="text-xs text-gray-400 mb-3">
          These apps will never be blocked, even during Forca zones.
        </p>
        <div className="flex flex-wrap gap-2">
          {['Code', 'Figma', 'GitHub Desktop', 'Notion', 'Spotify'].map((app) => (
            <span
              key={app}
              className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-full text-xs font-medium border border-green-200 dark:border-green-800"
            >
              {app} ✓
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
