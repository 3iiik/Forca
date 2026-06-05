import { ipcMain, app, BrowserWindow } from 'electron';
import { UpdaterService } from '../services/updater.service';

export function registerAppIpc(updaterService: UpdaterService) {
  ipcMain.handle('app:minimize', async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });

  ipcMain.handle('app:close', async () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });

  ipcMain.handle('app:get-version', async () => {
    return app.getVersion();
  });

  ipcMain.handle('app:check-update', async () => {
    return updaterService.checkForUpdates();
  });

  ipcMain.handle('app:install-update', async () => {
    updaterService.installUpdate();
  });
}
