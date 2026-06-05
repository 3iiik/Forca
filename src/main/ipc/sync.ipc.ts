import { ipcMain } from 'electron';
import { SyncService } from '../services/sync.service';

export function registerSyncIpc(syncService: SyncService) {
  ipcMain.handle('sync:upload', async () => {
    await syncService.upload();
  });

  ipcMain.handle('sync:download', async () => {
    await syncService.download();
  });

  ipcMain.handle('sync:status', async () => {
    return syncService.getStatus();
  });
}
