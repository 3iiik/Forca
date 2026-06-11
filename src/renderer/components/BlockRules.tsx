import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';

export default function BlockRules() {
  const { zones, setZones } = useAppStore();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [newSite, setNewSite] = useState('');
  const [extensionConnected, setExtensionConnected] = useState(false);

  useEffect(() => {
    loadZones();

    const poll = setInterval(async () => {
      try {
        const count = await window.electronAPI.extension.getClientCount();
        setExtensionConnected(count > 0);
      } catch {
        setExtensionConnected(false);
      }
    }, 3000);

    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const selectedZone = zones.find(z => z.id === selectedZoneId) || zones[0];

  const updateZone = async (update: Partial<typeof selectedZone>) => {
    if (!selectedZone) return;
    const updated = { ...selectedZone, ...update };
    await window.electronAPI.zone.update(updated);
    await loadZones();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Block Rules</h1>
        <div className="flex items-center gap-2 text-sm">
          <span className={`w-2 h-2 rounded-full ${extensionConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-gray-400">
            Extension {extensionConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

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
        <div className="max-w-xl">
          {/* Blocked Sites */}
          <div className="focus-card">
            <h2 className="font-semibold mb-3">Blocked Websites — {selectedZone.name}</h2>
            <p className="text-xs text-gray-400 mb-3">
              Sites will be blocked in your browser via the Forca extension.
              Install the extension during onboarding.
            </p>
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
    </div>
  );
}
