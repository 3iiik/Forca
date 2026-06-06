import { ipcMain } from 'electron';
import { BlockingService } from '../services/blocker.service';
import store from '../store/store';

export function registerBlockerIpc(blocker: BlockingService) {
  ipcMain.handle('blocker:block-apps', async (_event, apps: string[]) => {
    await blocker.blockApps(apps);
  });

  ipcMain.handle('blocker:unblock-apps', async () => {
    await blocker.unblockApps();
  });

  ipcMain.handle('blocker:block-sites', async (_event, sites: string[]) => {
    await blocker.blockSites(sites);
  });

  ipcMain.handle('blocker:unblock-sites', async () => {
    await blocker.unblockSites();
  });

  ipcMain.handle('blocker:get-blocked-apps', async () => {
    return blocker.getBlockedApps();
  });

  ipcMain.handle('blocker:get-allowed-apps', async () => {
    const apps = store.get('alwaysAllowedApps');
    blocker.setAlwaysAllowedApps(apps);
    return apps;
  });

  ipcMain.handle('blocker:set-allowed-apps', async (_event, apps: string[]) => {
    store.set('alwaysAllowedApps', apps);
    blocker.setAlwaysAllowedApps(apps);
  });
}
