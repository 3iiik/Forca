import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';

export class UpdaterService {
  private window: BrowserWindow | null = null;

  setWindow(win: BrowserWindow) {
    this.window = win;
  }

  init() {
    autoUpdater.autoDownload = false;

    autoUpdater.on('update-available', (info) => {
      this.window?.webContents.send('update:available', {
        version: info.version,
        releaseDate: info.releaseDate,
      });
    });

    autoUpdater.on('download-progress', (progress) => {
      this.window?.webContents.send('update:progress', {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
      });
    });

    autoUpdater.on('update-downloaded', () => {
      this.window?.webContents.send('update:downloaded');
    });

    autoUpdater.on('error', (err) => {
      console.error('Update error:', err);
    });
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
        console.debug('Update check failed:', err);
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
