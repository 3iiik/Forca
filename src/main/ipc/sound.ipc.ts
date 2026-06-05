import { ipcMain } from 'electron';
import { SoundService } from '../services/sound.service';
import { AmbientSoundType } from '../../shared/types';

export function registerSoundIpc(soundService: SoundService) {
  ipcMain.handle('sound:play', async (_event, sound: AmbientSoundType, volume: number) => {
    await soundService.play(sound, volume);
  });

  ipcMain.handle('sound:stop', async () => {
    soundService.stop();
  });

  ipcMain.handle('sound:volume', async (_event, volume: number) => {
    soundService.setVolume(volume);
  });
}
