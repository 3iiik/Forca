import { ipcMain } from 'electron';
import { BlockingService } from '../services/blocker.service';

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
}
