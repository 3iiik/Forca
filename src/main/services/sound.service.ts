import { BrowserWindow } from 'electron';
import { AmbientSoundType } from '../../shared/types';

export class SoundService {
  private window: BrowserWindow | null = null;

  setWindow(win: BrowserWindow) {
    this.window = win;
  }

  async play(sound: AmbientSoundType, volume: number): Promise<void> {
    if (sound === 'none' || !this.window || this.window.isDestroyed()) return;
    this.window.webContents.send('sound:play', sound, volume);
  }

  stop(): void {
    if (!this.window || this.window.isDestroyed()) return;
    this.window.webContents.send('sound:stop');
  }

  setVolume(volume: number): void {
    if (!this.window || this.window.isDestroyed()) return;
    this.window.webContents.send('sound:volume', volume);
  }

  fadeOut(durationMs: number = 3000): void {
    if (!this.window || this.window.isDestroyed()) return;
    this.window.webContents.send('sound:fade-out', durationMs);
  }
}
