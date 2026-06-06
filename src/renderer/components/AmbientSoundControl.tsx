import { useState, useEffect } from 'react';
import { useAppStore } from '../stores/appStore';
import { AmbientSoundType } from '../types';

const sounds: { id: AmbientSoundType; label: string; icon: string }[] = [
  { id: 'rain', label: 'Rain', icon: '🌧' },
  { id: 'white-noise', label: 'White Noise', icon: '📡' },
  { id: 'forest', label: 'Forest', icon: '🌲' },
];

export default function AmbientSoundControl() {
  const { activeZone } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (activeZone?.status === 'running') {
      setCurrentSound(activeZone.ambientSound);
      setVolume(activeZone.ambientVolume);
    }
  }, [activeZone]);

  const handlePlay = async (sound: AmbientSoundType) => {
    if (isPlaying && currentSound === sound) {
      await window.electronAPI.sound.stop();
      setIsPlaying(false);
      setCurrentSound('none');
    } else {
      await window.electronAPI.sound.stop();
      await window.electronAPI.sound.play(sound, volume);
      setCurrentSound(sound);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    setVolume(newVolume);
    if (isPlaying) {
      await window.electronAPI.sound.setVolume(newVolume);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`btn-ghost flex items-center gap-1.5 text-sm ${
          isPlaying ? 'text-primary-600' : ''
        }`}
      >
        <span>{isPlaying ? '🔊' : '🔇'}</span>
        {isPlaying && <span className="text-xs">{sounds.find(s => s.id === currentSound)?.label}</span>}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 p-4">
            <h4 className="text-sm font-semibold mb-3">Ambient Sounds</h4>
            <div className="space-y-2">
              {sounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handlePlay(sound.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    currentSound === sound.id && isPlaying
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span className="text-lg">{sound.icon}</span>
                  <span className="flex-1 text-left">{sound.label}</span>
                  {currentSound === sound.id && isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                <span>Volume</span>
                <span>{volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-primary-500"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
