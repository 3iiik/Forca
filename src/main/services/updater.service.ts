import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';
import { logger } from '../utils/logger';

export class UpdaterService {
  private window: BrowserWindow | null = null;

  setWindow(win: BrowserWindow) {
    this.window = win;
  }

  init() {
    autoUpdater.autoDownload = false;
  }

  async checkForUpdates(): Promise<{ available: boolean; version?: string }> {
    try {
      const result = await autoUpdater.checkForUpdates();
      if (result && result.updateInfo) {
        return {
          available: true,
          version: result.updateInfo.version,
        };
      }
    } catch (err) {
      // Not published yet, that's fine
      if (process.env.NODE_ENV !== 'production') {
        logger.debug('Update check failed:', err);
      }
    }
    return { available: false };
  }

  downloadUpdate() {
    autoUpdater.downloadUpdate();
  }

  installUpdate() {
    autoUpdater.quitAndInstall();
  }
}
