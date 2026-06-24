import { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../stores/appStore';
import { ZoneProfile } from '../types';
import { logger } from '../utils/logger';
import { Target, Search, Monitor, Settings, FolderOpen, PartyPopper, CheckCircle } from 'lucide-react';

type ChromiumPhase =
  | 'idle'
  | 'detecting'
  | 'picking'
  | 'open-extensions'
  | 'dev-mode'
  | 'load-unpacked'
  | 'verifying'
  | 'done';

interface DetectedBrowser {
  id: string;
  name: string;
  exePath: string;
  extensionsUrl: string;
}

function track(event: string, props?: Record<string, unknown>) {
  window.electronAPI.analytics.track(event, props).catch(() => {});
}

const CHROMIUM_STEP_PHASES: ChromiumPhase[] = [
  'open-extensions',
  'dev-mode',
  'load-unpacked',
];

export default function OnboardingFlow() {
  const { setOnboardingComplete, setCurrentView, setZones, setProfiles } = useAppStore();
  const [step, setStep] = useState(1);
  const [zoneName, setZoneName] = useState('Deep Work');
  const [duration, setDuration] = useState(60);
  const [sitesToBlock, setSitesToBlock] = useState('');
  const [selectedBrowser, setSelectedBrowser] = useState<string | null>(null);
  const [extensionConnected, setExtensionConnected] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyElapsed, setVerifyElapsed] = useState(0);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [chromiumPhase, setChromiumPhase] = useState<ChromiumPhase>('idle');
  const [detectedBrowsers, setDetectedBrowsers] = useState<DetectedBrowser[]>([]);
  const [selectedChromium, setSelectedChromium] = useState<DetectedBrowser | null>(null);
  const [chromiumStepIndex, setChromiumStepIndex] = useState(-1);
  const [celebration, setCelebration] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    track('onboarding_step_1_view');
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  useEffect(() => {
    if (celebration) {
      const t = setTimeout(() => {
        setCelebration(false);
        setStep(4);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [celebration]);

  const handleCreateZone = async () => {
    try {
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

      const profile: ZoneProfile = {
        id: crypto.randomUUID(),
        name: zoneName || 'Deep Work',
        icon: 'target',
        blockedSites,
        ambientSound: null,
        ambientVolume: 50,
        timerStyle: 'countdown',
        defaultDuration: duration || 60,
      };
      await window.electronAPI.profiles.save(profile);

      track('onboarding_zone_created', { zoneName, siteCount: blockedSites.length });
      setStep(3);
    } catch (err) {
      logger.error('[onboarding] create zone failed', err);
      setStoreError(String(err));
    }
  };

  const startPolling = () => {
    setVerifying(true);
    setVerifyElapsed(0);
    let attempts = 0;

    elapsedRef.current = setInterval(() => {
      setVerifyElapsed(prev => prev + 2);
    }, 2000);

    pollRef.current = setInterval(async () => {
      try {
        const count = await window.electronAPI.extension.getClientCount();
        attempts++;
        if (count > 0) {
          setExtensionConnected(true);
          setVerifying(false);
          setCelebration(true);
          track('onboarding_extension_connected', { browser: selectedBrowser });
          if (pollRef.current) clearInterval(pollRef.current);
          if (elapsedRef.current) clearInterval(elapsedRef.current);
          pollRef.current = null;
          elapsedRef.current = null;
        } else if (attempts >= 60) {
          setVerifying(false);
          track('onboarding_verify_timeout', { browser: selectedBrowser, elapsed: attempts * 2 });
          if (pollRef.current) clearInterval(pollRef.current);
          if (elapsedRef.current) clearInterval(elapsedRef.current);
          pollRef.current = null;
          elapsedRef.current = null;
        }
      } catch {
        attempts++;
        if (attempts >= 60) {
          setVerifying(false);
          if (pollRef.current) clearInterval(pollRef.current);
          if (elapsedRef.current) clearInterval(elapsedRef.current);
          pollRef.current = null;
          elapsedRef.current = null;
        }
      }
    }, 2000);
  };

  const handleBrowserSelect = (browserId: string) => {
    setSelectedBrowser(browserId);
    setStoreError(null);
    track('onboarding_browser_selected', { browser: browserId });

    if (browserId === 'firefox') {
      setChromiumPhase('idle');
    } else if (browserId === 'chromium') {
      setChromiumPhase('detecting');
      detectAndPickBest();
    }
  };

  const detectAndPickBest = async () => {
    try {
      const browsers = await window.electronAPI.extension.detectBrowsers();
      setDetectedBrowsers(browsers);
      track('onboarding_browsers_detected', { count: browsers.length, names: browsers.map(b => b.id) });

      if (browsers.length === 0) {
        setChromiumPhase('picking');
      } else {
        const best = await window.electronAPI.extension.pickBestBrowser();
        if (best) {
          setSelectedChromium(best);
          setChromiumPhase('open-extensions');
          setChromiumStepIndex(0);
          track('onboarding_chromium_auto_selected', { browser: best.id });
          await window.electronAPI.extension.openExtensionsPage(best.id);
        } else {
          setChromiumPhase('picking');
        }
      }
    } catch (err) {
      logger.error('[onboarding] detect browsers failed', err);
      setDetectedBrowsers([]);
      setChromiumPhase('picking');
    }
  };

  const handleChromiumBrowserPick = async (b: DetectedBrowser) => {
    setSelectedChromium(b);
    setStoreError(null);
    setChromiumPhase('open-extensions');
    setChromiumStepIndex(0);
    track('onboarding_chromium_picked', { browser: b.id });
    try {
      await window.electronAPI.extension.openExtensionsPage(b.id);
    } catch (err) {
      logger.error('[onboarding] open extensions page failed', err);
      setStoreError('Could not open the extensions page. Try opening it manually.');
    }
  };

  const handleDevModeDone = () => {
    setChromiumPhase('load-unpacked');
    setChromiumStepIndex(2);
    openExtFolder();
  };

  const openExtFolder = async () => {
    try {
      const result = await window.electronAPI.extension.openExtensionFolder();
      if (!result.success) {
        setStoreError(result.details || 'Could not open extension folder');
      }
    } catch (err) {
      logger.error('[onboarding] open extension folder failed', err);
      setStoreError('Could not open extension folder');
    }
  };

  const handleLoadUnpackedDone = () => {
    setChromiumPhase('verifying');
    track('onboarding_chromium_loaded', { browser: selectedChromium?.id });
    startPolling();
  };

  const handleFirefoxInstall = async () => {
    try {
      const result = await window.electronAPI.extension.openStore('firefox');
      if (result.success) {
        startPolling();
      } else {
        setStoreError(result.details || 'Could not open Firefox Add-ons');
      }
    } catch (err) {
      logger.error('[onboarding] open store failed', err);
      setStoreError(String(err));
    }
  };

  const handleSkipExtension = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    pollRef.current = null;
    elapsedRef.current = null;
    setVerifying(false);
    setExtensionConnected(true);
    setCelebration(true);
    track('onboarding_extension_skipped', { browser: selectedBrowser });
  };

  const handleComplete = async () => {
    await window.electronAPI.app.completeOnboarding();
    track('onboarding_completed');
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

  const goBack = (targetPhase: ChromiumPhase, stepIdx: number) => {
    setChromiumPhase(targetPhase);
    setChromiumStepIndex(stepIdx);
    setStoreError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-800/5 rounded-full blur-3xl" />
      </div>
      <div className="max-w-lg w-full mx-4 relative z-10">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 flex items-center justify-center text-xs font-bold transition-all duration-300 rounded-lg ${
                s <= step
                  ? 'bg-primary-700 text-zinc-100 shadow-lg shadow-primary-900/40'
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
              }`}>
                {s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-0.5 rounded-full transition-all duration-300 ${
                  s < step
                    ? 'bg-gradient-to-r from-primary-600 to-primary-400'
                    : 'bg-zinc-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* ── Step 1: Welcome ─────────────────────── */}
        {step === 1 && (
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary-900/30 border border-primary-700/40 flex items-center justify-center shadow-xl shadow-primary-900/20">
                <Target className="w-8 h-8 text-primary-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-3">Welcome to Forca</h1>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed max-w-md mx-auto">
              Forca detects when your meetings end and automatically starts focus zones.
              It blocks distracting websites via the Forca browser extension,
              enables Do Not Disturb, plays ambient sounds, and tracks your productivity.
            </p>
            <button onClick={() => { track('onboarding_step_2_view'); setStep(2); }} className="btn-primary text-base px-8 py-3 shadow-lg shadow-primary-900/30">
              Get Started
            </button>
          </div>
        )}

        {/* ── Step 2: Create Zone ─────────────────── */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-lg font-bold text-zinc-100 mb-6">Create Your First Zone</h2>
            {storeError && (
              <div className="bg-zinc-900/80 p-4 border border-red-900/50 mb-4 rounded-xl">
                <p className="text-xs text-zinc-400">{storeError}</p>
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Zone Name</label>
                <input
                  type="text"
                  value={zoneName}
                  onChange={e => setZoneName(e.target.value)}
                  className="input-field"
                  placeholder="Deep Work"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Duration (minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(Math.max(5, parseInt(e.target.value) || 5))}
                  className="input-field"
                  min={5}
                  max={480}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Websites to Block</label>
                <input
                  type="text"
                  value={sitesToBlock}
                  onChange={e => setSitesToBlock(e.target.value)}
                  className="input-field"
                  placeholder="youtube.com, reddit.com, twitter.com"
                />
                <p className="text-[11px] text-zinc-500 mt-1">Domain names separated by commas</p>
              </div>
              <button onClick={handleCreateZone} className="btn-primary w-full text-base py-3 mt-2 shadow-lg shadow-primary-900/30">
                Create Zone
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors mt-1"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Browser extension ───────────── */}
        {step === 3 && (
          <div className="animate-fade-in">

            {/* Browser selection cards */}
            {chromiumPhase === 'idle' && (
              <>
                <h2 className="text-lg font-bold text-zinc-100 mb-2">Install Browser Extension</h2>
                <p className="text-xs text-zinc-500 mb-5">Choose your browser to get started</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => handleBrowserSelect('firefox')}
                    className={`relative p-4 text-left transition-all border rounded-xl ${
                      selectedBrowser === 'firefox'
                        ? 'border-primary-600 bg-primary-900/20 shadow-lg shadow-primary-900/20'
                        : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-lg hover:shadow-zinc-900/30'
                    }`}
                  >
                    <span className="absolute top-2 right-2 text-[10px] font-medium text-green-400 bg-zinc-800/80 px-1.5 py-px rounded border border-green-900/30">
                      Easy install
                    </span>
                    <div className="w-9 h-9 flex items-center justify-center text-white font-bold text-base mb-2 rounded-md bg-gradient-to-br from-orange-500 to-orange-600 shadow-md">
                      F
                    </div>
                    <div className="text-sm font-medium text-zinc-200">Firefox / Waterfox</div>
                    <div className="text-[11px] text-zinc-500 mt-1">Install from Add-ons store</div>
                  </button>
                  <button
                    onClick={() => handleBrowserSelect('chromium')}
                    className={`relative p-4 text-left transition-all border rounded-xl ${
                      selectedBrowser === 'chromium'
                        ? 'border-primary-600 bg-primary-900/20 shadow-lg shadow-primary-900/20'
                        : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-lg hover:shadow-zinc-900/30'
                    }`}
                  >
                    <span className="absolute top-2 right-2 text-[10px] font-medium text-amber-400 bg-zinc-800/80 px-1.5 py-px rounded border border-amber-900/30">
                      Manual setup
                    </span>
                    <div className="w-9 h-9 flex items-center justify-center text-white font-bold text-base mb-2 rounded-md bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-md">
                      C
                    </div>
                    <div className="text-sm font-medium text-zinc-200">Chrome, Edge, Brave &amp; More</div>
                    <div className="text-[11px] text-zinc-500 mt-1">Load via Developer Mode (~2 min)</div>
                  </button>
                </div>

                {storeError && (
                  <div className="bg-zinc-900/80 p-4 border border-red-900/50 mb-4 rounded-xl">
                    <p className="text-xs text-zinc-400">{storeError}</p>
                  </div>
                )}

                {selectedBrowser === 'firefox' && !verifying && !extensionConnected && !celebration && (
                  <button onClick={handleFirefoxInstall} className="btn-primary w-full py-3 text-sm shadow-lg shadow-primary-900/30">
                    Open Firefox Add-ons
                  </button>
                )}
              </>
            )}

            {/* Detecting spinner */}
            {chromiumPhase === 'detecting' && (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent animate-spin rounded-full" />
                <span className="text-xs text-zinc-400">Looking for your browsers...</span>
              </div>
            )}

            {/* Browser picker (shown if none detected or only detected 0) */}
            {chromiumPhase === 'picking' && (
              <div>
                {detectedBrowsers.length > 0 && (
                  <>
                    <h2 className="text-lg font-bold text-zinc-100 mb-1">Choose Your Browser</h2>
                    <p className="text-xs text-zinc-500 mb-4">Pick which browser to install the extension in.</p>
                    <div className="space-y-2 mb-6">
                      {detectedBrowsers.map(b => (
                        <button
                          key={b.id}
                          onClick={() => handleChromiumBrowserPick(b)}
                          className="w-full p-3 text-left border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900 transition-all rounded-xl"
                        >
                          <div className="text-sm font-medium text-zinc-200">{b.name}</div>
                          <div className="text-[11px] text-zinc-500 mt-px truncate">{b.exePath}</div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {detectedBrowsers.length === 0 && (
                  <div className="text-center py-6">
                    <div className="flex justify-center mb-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center">
                        <Search className="w-6 h-6 text-zinc-500" />
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">No supported browser detected</p>
                    <p className="text-xs text-zinc-500 mb-5">Make sure Chrome, Edge, or Brave is installed, then try again.</p>
                    <div className="flex flex-col gap-2">
                      <button onClick={detectAndPickBest} className="btn-primary w-full py-2.5 text-sm shadow-lg shadow-primary-900/30">
                        Try Again
                      </button>
                      <button
                        onClick={() => { setSelectedBrowser(null); setChromiumPhase('idle'); }}
                        className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        Choose a different browser
                      </button>
                      <button onClick={handleSkipExtension} className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                        Skip this step
                      </button>
                    </div>
                  </div>
                )}

                {detectedBrowsers.length > 0 && (
                  <button
                    onClick={() => { setSelectedBrowser(null); setChromiumPhase('idle'); }}
                    className="w-full text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Go back
                  </button>
                )}
              </div>
            )}

            {/* Chromium substep progress dots */}
            {chromiumPhase !== 'idle' && chromiumPhase !== 'detecting' && chromiumPhase !== 'picking' && selectedChromium && (
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {CHROMIUM_STEP_PHASES.map((phase, i) => {
                  const cur = chromiumPhase as string;
                  const active = cur === phase;
                  const done = CHROMIUM_STEP_PHASES.indexOf(cur as ChromiumPhase) > i ||
                    cur === 'verifying' || cur === 'done' ||
                    (cur === 'load-unpacked' && i < 2);
                  return (
                    <div
                      key={phase}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        active ? 'bg-primary-500 w-6 shadow-sm shadow-primary-500/40' : done ? 'bg-primary-700 w-2' : 'bg-zinc-700 w-2'
                      }`}
                    />
                  );
                })}
                <span className="text-[10px] text-zinc-500 ml-2">
                  Step {chromiumStepIndex + 1} of 3
                </span>
              </div>
            )}

            {/* Step 1/3: Open extensions page */}
            {chromiumPhase === 'open-extensions' && selectedChromium && (
              <div className="text-center">
                <div className="w-14 h-14 flex items-center justify-center mb-4 mx-auto bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-lg">
                  <Monitor className="w-6 h-6 text-zinc-300" />
                </div>
                <h2 className="text-lg font-bold text-zinc-100 mb-2">Open Extensions Page</h2>
                <p className="text-xs text-zinc-500 mb-5">
                  A new tab should open with <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded text-[11px]">{selectedChromium.extensionsUrl}</code>.
                </p>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-4 text-left">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    If it didn&apos;t open, type <code className="text-zinc-200 bg-zinc-800 px-1 rounded">{selectedChromium.extensionsUrl}</code> into your {selectedChromium.name} address bar manually.
                  </p>
                </div>

                {storeError && (
                  <div className="bg-zinc-900/80 p-4 border border-red-900/50 mb-4 rounded-xl">
                    <p className="text-xs text-zinc-400">{storeError}</p>
                  </div>
                )}

                <button onClick={() => { setChromiumPhase('dev-mode'); setChromiumStepIndex(1); }} className="btn-primary w-full py-3 text-sm shadow-lg shadow-primary-900/30">
                  I see the Extensions Page
                </button>
                <p className="mt-2">
                  <button
                    onClick={() => window.electronAPI.extension.openExtensionsPage(selectedChromium.id)}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Re-open extensions page
                  </button>
                </p>
              </div>
            )}

            {/* Step 2/3: Enable Developer Mode */}
            {chromiumPhase === 'dev-mode' && (
              <div className="text-center">
                <div className="w-14 h-14 flex items-center justify-center mb-4 mx-auto bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-lg">
                  <Settings className="w-6 h-6 text-zinc-300" />
                </div>
                <h2 className="text-lg font-bold text-zinc-100 mb-2">Enable Developer Mode</h2>
                <p className="text-xs text-zinc-500 mb-5">
                  Turn on <strong className="text-zinc-300">Developer mode</strong> so you can load extensions from a folder.
                </p>
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-between mb-3 px-2">
                    <span className="text-xs text-zinc-400 font-medium">Extensions</span>
                    <span className="text-[10px] text-zinc-500">Manage your extensions</span>
                  </div>
                  <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-xs text-zinc-300">Developer mode</span>
                    <div className="w-10 h-6 bg-primary-600 rounded-full relative flex items-center transition-colors shadow-sm">
                      <div className="w-[18px] h-[18px] bg-white rounded-full shadow-sm ml-auto mr-[3px]" />
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">Toggle this switch on in the top-right corner</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goBack('open-extensions', 0)}
                    className="btn-secondary flex-1 py-3 text-sm"
                  >
                    Back
                  </button>
                  <button onClick={handleDevModeDone} className="btn-primary flex-[2] py-3 text-sm shadow-lg shadow-primary-900/30">
                    Developer Mode is On
                  </button>
                </div>
              </div>
            )}

            {/* Step 3/3: Load unpacked */}
            {chromiumPhase === 'load-unpacked' && (
              <div className="text-center">
                <div className="w-14 h-14 flex items-center justify-center mb-4 mx-auto bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-lg">
                  <FolderOpen className="w-6 h-6 text-zinc-300" />
                </div>
                <h2 className="text-lg font-bold text-zinc-100 mb-2">Load the Extension</h2>
                <p className="text-xs text-zinc-500 mb-5">
                  Click <strong className="text-zinc-300">Load unpacked</strong> on the extensions page and select the opened folder.
                </p>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mb-4 text-left space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-primary-800 text-zinc-100 rounded-md shrink-0 shadow-sm">1</div>
                    <p className="text-xs text-zinc-300">Click <strong className="text-zinc-200">Load unpacked</strong> button that appeared after enabling Developer mode</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-primary-800 text-zinc-100 rounded-md shrink-0 shadow-sm">2</div>
                    <p className="text-xs text-zinc-300">Select the <strong className="text-zinc-200">chromium-extension</strong> folder that just opened</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 flex items-center justify-center text-xs font-bold bg-primary-800 text-zinc-100 rounded-md shrink-0 shadow-sm">3</div>
                    <p className="text-xs text-zinc-300">The FORCA extension should appear in your extensions list</p>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-dashed border-zinc-700/50 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-zinc-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                    </svg>
                    <span className="text-xs">The extension folder has been opened in your file manager</span>
                  </div>
                </div>

                {storeError && (
                  <div className="bg-zinc-900/80 p-4 border border-red-900/50 mb-4 rounded-xl">
                    <p className="text-xs text-zinc-400">{storeError}</p>
                  </div>
                )}

                <button onClick={handleLoadUnpackedDone} className="btn-primary w-full py-3 text-sm shadow-lg shadow-primary-900/30">
                  I Loaded the Extension
                </button>
                <p className="mt-2">
                  <button onClick={openExtFolder} className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">
                    Reopen extension folder
                  </button>
                </p>
              </div>
            )}

            {/* Verifying (Chromium) */}
            {chromiumPhase === 'verifying' && !extensionConnected && !celebration && (
              <div className="text-center">
                <h2 className="text-lg font-bold text-zinc-100 mb-4">Waiting for Connection</h2>
                <div className="bg-zinc-900/80 p-6 border border-zinc-800 space-y-4 rounded-2xl shadow-xl">
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent animate-spin rounded-full" />
                    <span className="text-xs text-zinc-400">
                      Waiting for {selectedChromium?.name || 'browser'} extension to connect...
                    </span>
                  </div>
                  {verifyElapsed >= 10 && (
                    <p className="text-[10px] text-zinc-600">
                      Still waiting after {verifyElapsed}s &mdash; make sure the extension is enabled
                    </p>
                  )}
                  <div className="text-center space-y-2">
                    <button
                      onClick={handleSkipExtension}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Skip (I&apos;ll install later)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Verifying (Firefox) */}
            {verifying && selectedBrowser === 'firefox' && !extensionConnected && !celebration && (
              <div className="bg-zinc-900/80 p-6 border border-zinc-800 space-y-4 rounded-2xl shadow-xl">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent animate-spin rounded-full" />
                  <span className="text-xs text-zinc-400">
                    Waiting for Firefox extension to connect...
                  </span>
                </div>
                {verifyElapsed >= 10 && (
                  <p className="text-[10px] text-zinc-600 text-center">
                    Still waiting after {verifyElapsed}s &mdash; make sure the extension is installed and enabled
                  </p>
                )}
                <div className="text-center space-y-2">
                  <button
                    onClick={handleSkipExtension}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    Skip (I&apos;ll install later)
                  </button>
                  <p>
                    <button
                      onClick={handleFirefoxInstall}
                      className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      Re-open Firefox Add-ons
                    </button>
                  </p>
                </div>
              </div>
            )}

            {/* Celebration */}
            {celebration && (
              <div className="text-center py-8 animate-fade-in">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-primary-900/30 border border-primary-700/40 flex items-center justify-center shadow-xl shadow-primary-900/20">
                    <PartyPopper className="w-8 h-8 text-primary-400" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-zinc-100 mb-1">Extension Connected!</h3>
                <p className="text-xs text-zinc-500">Your browser is now linked to Forca.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Step 4: Complete ────────────────────── */}
        {step === 4 && (
          <div className="text-center animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary-900/30 border border-primary-700/40 flex items-center justify-center shadow-xl shadow-primary-900/20">
                <CheckCircle className="w-8 h-8 text-primary-400" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-zinc-100 mb-3">You&apos;re All Set!</h2>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed max-w-md mx-auto">
              Forca will auto-start this zone after your meetings end.
              The browser extension will block distracting sites during focus mode.
              You can create more zones and track your stats anytime.
            </p>
            <button onClick={handleComplete} className="btn-primary text-base px-8 py-3 shadow-lg shadow-primary-900/30">
              Start Using Forca
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
