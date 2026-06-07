import { useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { ZoneProfile, AmbientSoundType } from '../types';

const profileIcons = ['🎯', '🎨', '📝', '💻', '🧠', '🎵', '📚', '⚡'];
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
    icon: '🎯',
    blockedApps: [],
    allowedApps: [],
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
  };

  const handleSaveProfile = async () => {
    if (editingId) {
      // Update
      await window.electronAPI.profiles.save(editingProfile!);
    } else if (newProfile.name?.trim()) {
      const profile: ZoneProfile = {
        id: crypto.randomUUID(),
        name: newProfile.name,
        icon: newProfile.icon || '🎯',
        blockedApps: [],
        allowedApps: [],
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Zone Profiles</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
          <h2 className="font-semibold mb-3">Create Profile</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Name</label>
              <input
                type="text"
                value={newProfile.name}
                onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                placeholder="Writing Mode"
                className="input-field"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Icon</label>
              <div className="flex gap-1 flex-wrap">
                {profileIcons.map((icon) => (
                  <button
                    key={icon}
                    onClick={() => setNewProfile({ ...newProfile, icon })}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm ${
                      newProfile.icon === icon
                        ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Default Duration (min)</label>
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
              <label className="text-sm font-medium block mb-1">Ambient Sound</label>
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
          <button onClick={handleSaveProfile} className="btn-primary mt-4">
            Save Profile
          </button>
        </div>
      )}

      {/* Profiles list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400">
            <div className="text-3xl mb-2">👤</div>
            <p className="text-sm">No profiles yet. Create one to save your focus configurations.</p>
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
                    {profileIcons.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setEditingProfile({ ...editingProfile, icon })}
                        className={`w-8 h-8 rounded-lg text-sm ${
                          editingProfile.icon === icon ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500' : ''
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
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
                      <span className="text-2xl">{profile.icon}</span>
                      <div>
                        <h3 className="font-semibold">{profile.name}</h3>
                        <p className="text-xs text-gray-400">
                          {profile.defaultDuration} min · {profile.timerStyle}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => startEditing(profile)} className="btn-ghost text-xs">
                        ✏
                      </button>
                      <button onClick={() => handleDelete(profile.id)} className="btn-ghost text-xs text-red-400">
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {profile.ambientSound !== 'none' && (
                      <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 rounded text-xs">
                        🔊 {profile.ambientSound}
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded text-xs">
                      ⏱ {profile.defaultDuration}m
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      // Create zone from profile and start it
                      const zone = {
                        id: crypto.randomUUID(),
                        name: profile.name,
                        duration: profile.defaultDuration,
                        blockedApps: profile.blockedApps,
                        allowedApps: profile.allowedApps,
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
