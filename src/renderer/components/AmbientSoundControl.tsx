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
        className={`flex items-center gap-1.5 text-sm px-2 py-1 transition-colors ${
          isPlaying ? 'text-primary-400' : 'text-zinc-400 hover:text-zinc-300'
        }`}
      >
        <span className="text-sm">{isPlaying ? '🔊' : '🔇'}</span>
        {isPlaying && <span className="text-[11px]">{sounds.find(s => s.id === currentSound)?.label}</span>}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 bg-zinc-900 border border-zinc-800 z-50 p-4">
            <h4 className="text-xs font-semibold text-zinc-200 mb-3">Ambient Sounds</h4>
            <div className="space-y-1">
              {sounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => handlePlay(sound.id)}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 text-sm transition-colors ${
                    currentSound === sound.id && isPlaying
                      ? 'bg-primary-900/20 text-primary-300'
                      : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-base">{sound.icon}</span>
                  <span className="flex-1 text-left text-xs">{sound.label}</span>
                  {currentSound === sound.id && isPlaying && (
                    <span className="w-1.5 h-1.5 bg-primary-600 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-1">
                <span>Volume</span>
                <span>{volume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                className="w-full h-1 bg-zinc-800 appearance-none cursor-pointer accent-primary-700"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
