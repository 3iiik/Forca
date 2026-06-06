import { ipcMain, app, BrowserWindow } from 'electron';
import { UpdaterService } from '../services/updater.service';
import store from '../store/store';

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

  // Onboarding
  ipcMain.handle('app:get-onboarding-status', async () => {
    return store.get('onboardingComplete', false);
  });

  ipcMain.handle('app:complete-onboarding', async () => {
    store.set('onboardingComplete', true);
  });
}
