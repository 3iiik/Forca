import { ipcMain } from 'electron';
import { BlockingService } from '../services/blocker.service';

export function registerBlockerIpc(blocker: BlockingService) {
  ipcMain.handle('blocker:block-sites', async (_event, sites: string[]) => {
    await blocker.blockSites(sites);
  });

  ipcMain.handle('blocker:unblock-sites', async () => {
    await blocker.unblockSites();
  });

  ipcMain.handle('blocker:get-blocked-sites', async () => {
    return blocker.getBlockedSites();
  });
}
