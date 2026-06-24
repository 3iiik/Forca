import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { logger } from '../utils/logger';
import { X } from 'lucide-react';

export default function BlockRules() {
  const { zones, setZones } = useAppStore();
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [newSite, setNewSite] = useState('');
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    loadZones();
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

  const manualSocketPing = async () => {
    setReconnecting(true);
    try {
      const result = await window.electronAPI.extension.reconnect();
      if (result.success) {
        logger.info('[block-rules] WebSocket server restarted, clients:', result.clientCount);
      } else {
        logger.warn('[block-rules] reconnect failed:', (result as Record<string, unknown>).error);
      }
    } catch (err) {
      logger.error('[block-rules] manualSocketPing error:', err);
    } finally {
      setReconnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-100">Block Rules</h1>
      </div>

      {/* Reconnect to Extension */}
      <button
        onClick={manualSocketPing}
        disabled={reconnecting}
        className="rounded-full px-5 py-2 text-sm font-medium bg-primary-900/60 text-primary-300 border border-primary-800 hover:bg-primary-900 hover:text-primary-200 transition-colors disabled:opacity-50"
      >
        {reconnecting ? 'Reconnecting...' : 'Reconnect to Extension'}
      </button>

      {/* Zone selector */}
      {zones.length > 1 && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400">Zone:</label>
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
          <p className="text-xs text-zinc-500">No zones configured. Create one in Settings.</p>
        </div>
      ) : (
        <div className="w-full">
          {/* Blocked Sites */}
          <div className="focus-card w-full">
            <h2 className="text-sm font-semibold text-zinc-200 mb-3">Blocked Websites — {selectedZone.name}</h2>
            <p className="text-xs text-zinc-500 mb-3">
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
            <div className="space-y-1">
              {selectedZone.blockedSites.length > 0 ? (
                selectedZone.blockedSites.map((site, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-1.5 border border-zinc-800 bg-zinc-900/50 text-sm rounded-lg">
                    <span className="text-zinc-300">{site}</span>
                    <button
                      onClick={async () => {
                        if (selectedZone) {
                          await updateZone({ blockedSites: selectedZone.blockedSites.filter(s => s !== site) });
                        }
                      }}
                      className="text-zinc-500 hover:text-red-400 transition-colors"
                    ><X className="w-3.5 h-3.5" /></button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 py-2">No blocked sites configured</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
