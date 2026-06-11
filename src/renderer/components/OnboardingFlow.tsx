import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { logger } from '../utils/logger';

const BROWSERS = [
  { id: 'chrome', name: 'Google Chrome', color: '#4285F4', letter: 'C' },
  { id: 'brave', name: 'Brave', color: '#FB542B', letter: 'B' },
  { id: 'edge', name: 'Microsoft Edge', color: '#0078D7', letter: 'E' },
  { id: 'firefox', name: 'Firefox / Waterfox', color: '#FF7139', letter: 'F' },
];

const CHROMIUM_IDS = new Set(['chrome', 'brave', 'edge']);

export default function OnboardingFlow() {
  const { setOnboardingComplete, setCurrentView, setZones, setProfiles } = useAppStore();
  const [step, setStep] = useState(1);
  const [zoneName, setZoneName] = useState('Deep Work');
  const [duration, setDuration] = useState(60);
  const [sitesToBlock, setSitesToBlock] = useState('');
  const [selectedBrowser, setSelectedBrowser] = useState<string | null>(null);
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  useEffect(() => {
    if (extensionConnected) {
      const t = setTimeout(() => setStep(4), 1500);
      return () => clearTimeout(t);
    }
  }, [extensionConnected]);

  const handleCreateZone = async () => {
    const blockedSites = sitesToBlock
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const zone = {
      id: crypto.randomUUID(),
      name: zoneName || 'Deep Work',
      duration: duration || 60,
      blockedSites,
      trigger: { type: 'after-meeting' as const, afterMeetingDelay: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await window.electronAPI.zone.create(zone);
    setStep(3);
  };

  const startVerification = () => {
    setVerifying(true);
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      try {
        const count = await window.electronAPI.extension.getClientCount();
        attempts++;
        if (count > 0) {
          setExtensionConnected(true);
          setVerifying(false);
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        } else if (attempts >= 60) {
          setVerifying(false);
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        attempts++;
        if (attempts >= 60) {
          setVerifying(false);
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    }, 2000);
  };

  const handleBrowserSelect = (browserId: string) => {
    setSelectedBrowser(browserId);
    setStoreError(null);
  };

  const handleFirefoxInstall = async () => {
    try {
      const result = await window.electronAPI.extension.openStore('firefox');
      if (result.success) {
        startVerification();
      } else {
        setStoreError(result.details);
      }
    } catch (err) {
      logger.error('[onboarding] open store failed', err);
      setStoreError(String(err));
    }
  };

  const handleChromiumInstall = async () => {
    setStoreError(null);
    try {
      const result = await window.electronAPI.extension.launchWithExtension(selectedBrowser!);
      if (result.success) {
        startVerification();
      } else {
        setStoreError(result.details);
      }
    } catch (err) {
      logger.error('[onboarding] launch with extension failed', err);
      setStoreError(String(err));
    }
  };

  const isChromiumBrowser = (id: string | null) => id && CHROMIUM_IDS.has(id);

  const handleSkipExtension = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setExtensionConnected(true);
    setVerifying(false);
  };

  const handleComplete = async () => {
    await window.electronAPI.app.completeOnboarding();
    setOnboardingComplete(true);
    setCurrentView('today');
    const [zones, profiles] = await Promise.all([
      window.electronAPI.zone.list(),
      window.electronAPI.profiles.list(),
    ]);
    logger.debug('[onboarding] store zones:', JSON.stringify(zones));
    logger.debug('[onboarding] store profiles:', JSON.stringify(profiles));
    setZones(zones);
    setProfiles(profiles);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
      <div className="max-w-lg w-full mx-4">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s <= step
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 4 && <div className={`w-12 h-0.5 ${s < step ? 'bg-primary-600' : 'bg-gray-800'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-6">{'🎯'}</div>
            <h1 className="text-3xl font-bold text-white mb-3">Welcome to Forca</h1>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Forca detects when your meetings end and automatically starts focus zones.
              It blocks distracting websites via the Forca browser extension,
              enables Do Not Disturb, plays ambient sounds, and tracks your productivity.
            </p>
            <button onClick={() => setStep(2)} className="btn-primary text-lg px-8 py-3">
              Get Started
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Create Your First Zone</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Zone Name</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={e => setZoneName(e.target.value)}
                  className="input-field"
                  placeholder="Deep Work"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(parseInt(e.target.value) || 60)}
                  className="input-field"
                  min={5}
                  max={480}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Websites to Block</label>
                <input
                  type="text"
                  value={sitesToBlock}
                  onChange={e => setSitesToBlock(e.target.value)}
                  className="input-field"
                  placeholder="youtube.com, reddit.com, twitter.com"
                />
                <p className="text-xs text-gray-500 mt-1">Domain names separated by commas</p>
              </div>
              <button onClick={handleCreateZone} className="btn-primary w-full text-lg py-3 mt-2">
                Create Zone
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-2">Install Browser Extension</h2>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {BROWSERS.map(b => {
                const isChromium = CHROMIUM_IDS.has(b.id);
                const isSelected = selectedBrowser === b.id;
                const isBusy = verifying || extensionConnected;
                const isClickable = b.id === 'firefox' && !isBusy;
                return (
                  <button
                    key={b.id}
                    onClick={() => isClickable && handleBrowserSelect(b.id)}
                    disabled={!isClickable}
                    className={`relative rounded-xl p-4 text-left transition-all border-2 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-900/20'
                        : isChromium
                          ? 'border-gray-700 bg-gray-800/30 opacity-70'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-800/70'
                    } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {isChromium && (
                      <span className="absolute top-2 right-2 text-[10px] font-semibold text-yellow-500 bg-yellow-900/30 px-2 py-0.5 rounded-full">
                        Coming Soon
                      </span>
                    )}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg mb-2"
                      style={{ backgroundColor: b.color }}
                    >
                      {b.letter}
                    </div>
                    <div className="text-sm font-medium text-white">{b.name}</div>
                    {isChromium
                      ? <div className="text-xs text-gray-500 mt-1">Requires $5 dev registration</div>
                      : isSelected
                        ? <div className="text-xs text-primary-400 mt-1">Selected</div>
                        : <div className="text-xs text-gray-400 mt-1">Install from store</div>}
                  </button>
                );
              })}
            </div>

            {storeError && (
              <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-700/30 mb-4">
                <p className="text-sm text-yellow-300 mb-1">Something went wrong</p>
                <p className="text-xs text-gray-400">{storeError}</p>
              </div>
            )}

            {selectedBrowser === 'firefox' && !verifying && !extensionConnected && (
              <button
                onClick={handleFirefoxInstall}
                className="btn-primary w-full py-3 text-sm"
              >
                Install from Firefox Add-ons
              </button>
            )}

            {verifying && !extensionConnected && (
              <div className="bg-gray-800/70 rounded-xl p-6 border border-gray-700 space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-300">
                    Waiting for Firefox extension to connect...
                  </span>
                </div>
                <div className="text-center">
                  <button
                    onClick={handleSkipExtension}
                    className="text-xs text-gray-500 hover:text-gray-300 underline"
                  >
                    Skip (I&apos;ll install later)
                  </button>
                </div>
              </div>
            )}

            {extensionConnected && (
              <div className="text-center space-y-3">
                <div className="text-green-400 text-sm flex items-center justify-center gap-2 py-3">
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Connected! Proceeding...
                </div>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-6">{'✅'}</div>
            <h2 className="text-2xl font-bold text-white mb-3">You&apos;re All Set!</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Forca will auto-start this zone after your meetings end.
              The browser extension will block distracting sites during focus mode.
              You can create more zones and track your stats anytime.
            </p>
            <button onClick={handleComplete} className="btn-primary text-lg px-8 py-3">
              Start Using Forca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
