import { useState } from 'react';
import { useAppStore } from '../stores/appStore';

export default function OnboardingFlow() {
  const { setOnboardingComplete, setCurrentView, setZones, setProfiles } = useAppStore();
  const [step, setStep] = useState(1);
  const [zoneName, setZoneName] = useState('Deep Work');
  const [duration, setDuration] = useState(60);
  const [appsToBlock, setAppsToBlock] = useState('');
  const [sitesToBlock, setSitesToBlock] = useState('');

  const handleCreateZone = async () => {
    const blockedApps = appsToBlock
      .split(',')
      .map(a => a.trim().toLowerCase().replace(/\.exe$/i, ''))
      .filter(Boolean);
    const blockedSites = sitesToBlock
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const zone = {
      id: crypto.randomUUID(),
      name: zoneName || 'Deep Work',
      duration: duration || 60,
      blockedApps,
      allowedApps: [],
      blockedSites,
      trigger: { type: 'after-meeting' as const, afterMeetingDelay: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await window.electronAPI.zone.create(zone);

    // Also save as a profile so it shows on the Profiles page
    const profile = {
      id: crypto.randomUUID(),
      name: zoneName || 'Deep Work',
      icon: '🎯',
      blockedApps,
      allowedApps: [],
      blockedSites,
      ambientSound: 'none' as const,
      ambientVolume: 50,
      timerStyle: 'countdown' as const,
      defaultDuration: duration || 60,
    };
    await window.electronAPI.profiles.save(profile);

    setStep(3);
  };

  const handleComplete = async () => {
    await window.electronAPI.app.completeOnboarding();
    setOnboardingComplete(true);
    setCurrentView('today');
    const [zones, profiles] = await Promise.all([
      window.electronAPI.zone.list(),
      window.electronAPI.profiles.list(),
    ]);
    console.log('[onboarding] store zones:', JSON.stringify(zones));
    console.log('[onboarding] store profiles:', JSON.stringify(profiles));
    setZones(zones);
    setProfiles(profiles);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950">
      <div className="max-w-lg w-full mx-4">
        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                s <= step
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${s < step ? 'bg-primary-600' : 'bg-gray-800'}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-6">{"🎯"}</div>
            <h1 className="text-3xl font-bold text-white mb-3">Welcome to Forca</h1>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Forca detects when your meetings end and automatically starts focus zones.
              It blocks distracting apps and websites, enables Do Not Disturb,
              plays ambient sounds, and tracks your productivity.
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
                <label className="text-sm font-medium text-gray-300 block mb-1">Apps to Block</label>
                <input
                  type="text"
                  value={appsToBlock}
                  onChange={e => setAppsToBlock(e.target.value)}
                  className="input-field"
                  placeholder="discord, slack, chrome, spotify"
                />
                <p className="text-xs text-gray-500 mt-1">Process names separated by commas (without .exe)</p>
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
          <div className="text-center animate-fade-in">
            <div className="text-6xl mb-6">{"✅"}</div>
            <h2 className="text-2xl font-bold text-white mb-3">You&apos;re All Set!</h2>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Forca will auto-start this zone after your meetings end.
              You can create more zones, customize block rules, and track your stats anytime.
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
