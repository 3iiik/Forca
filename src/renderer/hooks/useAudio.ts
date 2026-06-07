import { useEffect, useRef, useCallback } from 'react';
import { AmbientSoundType } from '../types';
import { logger } from '../utils/logger';

const SAMPLE_RATE = 44100;
const DURATION = 30;

type SoundGenerators = Record<AmbientSoundType, (ctx: AudioContext) => AudioBuffer>;

function generateWhiteNoise(ctx: AudioContext): AudioBuffer {
  const length = SAMPLE_RATE * DURATION;
  const buffer = ctx.createBuffer(2, length, SAMPLE_RATE);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  return buffer;
}

function generateRain(ctx: AudioContext): AudioBuffer {
  const length = SAMPLE_RATE * DURATION;
  const buffer = ctx.createBuffer(2, length, SAMPLE_RATE);
  let brown = 0;
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      brown += (Math.random() * 2 - 1) * 0.02;
      if (brown > 1) brown = 2 - brown;
      if (brown < -1) brown = -2 - brown;
      const t = i / SAMPLE_RATE;
      const mod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * t);
      data[i] = brown * 0.4 * mod;
    }
  }
  return buffer;
}

function generateForest(ctx: AudioContext): AudioBuffer {
  const length = SAMPLE_RATE * DURATION;
  const buffer = ctx.createBuffer(2, length, SAMPLE_RATE);
  const chirps: { time: number; freq: number; dur: number }[] = [];
  for (let t = 0; t < DURATION - 0.3; t += 1.0 + Math.random() * 3) {
    chirps.push({
      time: t + Math.random() * 0.5,
      freq: 2000 + Math.random() * 2500,
      dur: 0.05 + Math.random() * 0.15,
    });
  }
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    let brown = 0;
    for (let i = 0; i < length; i++) {
      const t = i / SAMPLE_RATE;
      brown += (Math.random() * 2 - 1) * 0.008;
      if (brown > 1) brown = 2 - brown;
      if (brown < -1) brown = -2 - brown;
      let sample = brown * 0.25;
      for (const chirp of chirps) {
        const localT = t - chirp.time;
        if (localT >= 0 && localT < chirp.dur) {
          const envelope = Math.sin(Math.PI * localT / chirp.dur);
          sample += Math.sin(2 * Math.PI * chirp.freq * localT) * envelope * 0.06;
        }
      }
      data[i] = sample;
    }
  }
  return buffer;
}

const generators: SoundGenerators = {
  'rain': generateRain,
  'white-noise': generateWhiteNoise,
  'forest': generateForest,
  'none': () => { throw new Error('no generator for none'); },
};

export function useAudio() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const currentSoundRef = useRef<AmbientSoundType>('none');
  const bufferCache = useRef<Map<AmbientSoundType, AudioBuffer>>(new Map());

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
      let buffer = bufferCache.current.get(sound);
      if (!buffer) {
        const gen = generators[sound];
        if (!gen) throw new Error(`unknown sound: ${sound}`);
        buffer = gen(audioContextRef.current);
        bufferCache.current.set(sound, buffer);
      }

      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.gain.value = volume / 100;
      gainNodeRef.current.connect(audioContextRef.current.destination);

      sourceRef.current = audioContextRef.current.createBufferSource();
      sourceRef.current.buffer = buffer;
      sourceRef.current.loop = true;
      sourceRef.current.connect(gainNodeRef.current);
      sourceRef.current.start();

      currentSoundRef.current = sound;
    } catch (err) {
      logger.error('Audio play failed:', err);
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
    const api = window.electronAPI;
    if (!api) return;

    const unsubPlay = api.on('sound:play', (sound: AmbientSoundType, volume: number) => {
      play(sound, volume);
    });
    const unsubStop = api.on('sound:stop', stop);
    const unsubVolume = api.on('sound:volume', setVolume);
    const unsubFade = api.on('sound:fade-out', (duration: number) => fadeOut(duration));

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
