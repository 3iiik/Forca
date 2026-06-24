import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { ZoneProfile, AmbientSoundType } from '../types';
import {
  Target, Palette, FileText, Monitor, Brain, Music, BookOpen, Zap,
  User, Pencil, X, Volume2, Timer,
} from 'lucide-react';

const profileIcons = [
  { name: 'target', component: Target },
  { name: 'palette', component: Palette },
  { name: 'file-text', component: FileText },
  { name: 'monitor', component: Monitor },
  { name: 'brain', component: Brain },
  { name: 'music', component: Music },
  { name: 'book-open', component: BookOpen },
  { name: 'zap', component: Zap },
];

const iconComponents: Record<string, typeof Target> = {};
for (const ic of profileIcons) {
  iconComponents[ic.name] = ic.component;
}
const defaultIcon = 'target';

const soundOptions: { id: AmbientSoundType; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'rain', label: 'Rain' },
  { id: 'white-noise', label: 'White Noise' },
  { id: 'forest', label: 'Forest' },
];

export default function ZoneProfiles() {
  const { profiles, setProfiles } = useAppStore();
  const [editingProfile, setEditingProfile] = useState<ZoneProfile | null>(null);
  const [newProfile, setNewProfile] = useState<Partial<ZoneProfile>>({
    name: '',
    icon: defaultIcon,
    blockedSites: [],
    ambientSound: 'none',
    ambientVolume: 50,
    timerStyle: 'countdown',
    defaultDuration: 30,
  });
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfiles = async () => {
    const p = await window.electronAPI.profiles.list();
    setProfiles(p);
    for (const profile of p) {
      if (profile.icon && !(profile.icon in iconComponents)) {
        profile.icon = defaultIcon;
      }
    }
  };

  const handleSaveProfile = async () => {
    if (editingId) {
      await window.electronAPI.profiles.save(editingProfile!);
    } else if (newProfile.name?.trim()) {
      const profile: ZoneProfile = {
        id: crypto.randomUUID(),
        name: newProfile.name,
        icon: newProfile.icon || defaultIcon,
        blockedSites: [],
        ambientSound: newProfile.ambientSound || 'none',
        ambientVolume: newProfile.ambientVolume ?? 50,
        timerStyle: 'countdown',
        defaultDuration: newProfile.defaultDuration || 30,
      };
      await window.electronAPI.profiles.save(profile);
    }
    setEditingId(null);
    setShowNewForm(false);
    setEditingProfile(null);
    loadProfiles();
  };

  const handleDelete = async (profileId: string) => {
    await window.electronAPI.profiles.delete(profileId);
    loadProfiles();
  };

  const startEditing = (profile: ZoneProfile) => {
    setEditingId(profile.id);
    setEditingProfile({ ...profile });
  };

  const renderIcon = (iconName: string | null | undefined, className = 'w-5 h-5') => {
    const key = iconName && iconName in iconComponents ? iconName : defaultIcon;
    const Comp = iconComponents[key];
    return <Comp className={className} />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Zone Profiles</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Save and quickly switch between different focus configurations
          </p>
        </div>
        <button onClick={() => setShowNewForm(!showNewForm)} className="btn-primary text-sm">
          {showNewForm ? 'Cancel' : '+ New Profile'}
        </button>
      </div>

      {/* New profile form */}
      {showNewForm && (
        <div className="focus-card animate-fade-in">
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">Create Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Name</label>
              <input
                type="text"
                value={newProfile.name}
                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                placeholder="Writing Mode"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Icon</label>
              <div className="flex gap-1 flex-wrap">
                {profileIcons.map((ic) => {
                  const Comp = ic.component;
                  return (
                    <button
                      key={ic.name}
                      onClick={() => setNewProfile({ ...newProfile, icon: ic.name })}
                      className={`w-7 h-7 flex items-center justify-center ${
                        newProfile.icon === ic.name
                          ? 'bg-primary-900/30 border border-primary-700 text-primary-300'
                          : 'border border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <Comp className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Default Duration (min)</label>
              <input
                type="number"
                value={newProfile.defaultDuration}
                onChange={(e) => setNewProfile({ ...newProfile, defaultDuration: parseInt(e.target.value) || 30 })}
                className="input-field"
                min={5}
                max={240}
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Ambient Sound</label>
                <select
                  value={newProfile.ambientSound ?? 'none'}
                  onChange={(e) => setNewProfile({ ...newProfile, ambientSound: e.target.value as AmbientSoundType })}
                  className="input-field"
                >
                {soundOptions.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleSaveProfile} className="btn-primary mt-4 text-sm">
            Save Profile
          </button>
        </div>
      )}

      {/* Profiles list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-zinc-500">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-xl bg-zinc-800/50 border border-zinc-700/30 flex items-center justify-center">
                <User className="w-5 h-5 text-zinc-500" />
              </div>
            </div>
            <p className="text-xs">No profiles yet. Create one to save your focus configurations.</p>
          </div>
        ) : (
          profiles.map((profile) => (
            <div key={profile.id} className="focus-card">
              {editingId === profile.id && editingProfile ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    className="input-field"
                  />
                  <div className="flex gap-1">
                    {profileIcons.map((ic) => {
                      const Comp = ic.component;
                      return (
                        <button
                          key={ic.name}
                          onClick={() => setEditingProfile({ ...editingProfile, icon: ic.name })}
                          className={`w-7 h-7 flex items-center justify-center ${
                            editingProfile.icon === ic.name
                              ? 'bg-primary-900/30 border border-primary-700 text-primary-300'
                              : 'border border-zinc-800 text-zinc-500 hover:border-zinc-700'
                          }`}
                        >
                          <Comp className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveProfile} className="btn-primary text-sm">Save</button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary text-sm">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-primary-400">{renderIcon(profile.icon, 'w-5 h-5')}</span>
                      <div>
                        <h3 className="text-sm font-semibold text-zinc-200">{profile.name}</h3>
                        <p className="text-[11px] text-zinc-500">
                          {profile.defaultDuration} min · {profile.timerStyle}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEditing(profile)} className="btn-ghost text-xs">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(profile.id)} className="btn-ghost text-xs text-zinc-500 hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {profile.ambientSound !== 'none' && (
                      <span className="px-2 py-0.5 border border-zinc-800 text-zinc-400 text-[11px] flex items-center gap-1">
                        <Volume2 className="w-3 h-3" /> {profile.ambientSound}
                      </span>
                    )}
                    <span className="px-2 py-0.5 border border-zinc-800 text-zinc-400 text-[11px] flex items-center gap-1">
                      <Timer className="w-3 h-3" /> {profile.defaultDuration}m
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      const zone = {
                        id: crypto.randomUUID(),
                        name: profile.name,
                        duration: profile.defaultDuration,
                        blockedSites: profile.blockedSites,
                        trigger: { type: 'manual' as const },
                        profileId: profile.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                      };
                      const created = await window.electronAPI.zone.create(zone);
                      await window.electronAPI.zone.start(created.id);
                    }}
                    className="btn-primary text-sm w-full mt-3"
                  >
                    Start Profile
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
