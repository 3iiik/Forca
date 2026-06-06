import { useEffect, useRef, useCallback } from 'react';
import { AmbientSoundType } from '../types';

const soundFiles: Record<AmbientSoundType, string> = {
  'rain': '/sounds/rain.mp3',
  'white-noise': '/sounds/white-noise.mp3',
  'lofi': '/sounds/lofi.mp3',
  'forest': '/sounds/forest.mp3',
  'none': '',
};

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentSoundRef = useRef<AmbientSoundType>('none');

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch { /* ignore */ }


      sourceRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    gainNodeRef.current = null;
    currentSoundRef.current = 'none';
  }, []);

  const play = useCallback(async (sound: AmbientSoundType, volume: number) => {
    if (sound === 'none') return;
    stop();

    try {
      audioContextRef.current = new AudioContext();
      const url = soundFiles[sound];
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume / 100;
      gainNodeRef.current.connect(audioContextRef.current.destination);

      sourceRef.current = audioContextRef.current.createBufferSource();
      sourceRef.current.buffer = audioBuffer;
      sourceRef.current.loop = true;
      sourceRef.current.connect(gainNodeRef.current);
      sourceRef.current.start();

      currentSoundRef.current = sound;
    } catch (err) {
      console.error('Audio play failed:', err);
    }
  }, [stop]);

  const setVolume = useCallback((volume: number) => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(volume / 100, audioContextRef.current.currentTime);
    }
  }, []);

  const fadeOut = useCallback(async (durationMs: number = 3000) => {
    if (!gainNodeRef.current || !audioContextRef.current) return;

    const currentTime = audioContextRef.current.currentTime;
    const currentVolume = gainNodeRef.current.gain.value;
    gainNodeRef.current.gain.setValueAtTime(currentVolume, currentTime);
    gainNodeRef.current.gain.linearRampToValueAtTime(0, currentTime + durationMs / 1000);

    await new Promise(resolve => setTimeout(resolve, durationMs + 100));
    stop();
  }, [stop]);

  useEffect(() => {
    const unsubPlay = window.electronAPI.on('sound:play', (sound: AmbientSoundType, volume: number) => {
      play(sound, volume);
    });
    const unsubStop = window.electronAPI.on('sound:stop', stop);
    const unsubVolume = window.electronAPI.on('sound:volume', setVolume);
    const unsubFade = window.electronAPI.on('sound:fade-out', (duration: number) => fadeOut(duration));

    return () => {
      unsubPlay();
      unsubStop();
      unsubVolume();
      unsubFade();
      stop();
    };
  }, [play, stop, setVolume, fadeOut]);

  return { play, stop, setVolume, fadeOut };
}
