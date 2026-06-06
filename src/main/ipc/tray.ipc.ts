import { ipcMain } from 'electron';
import { TrayService } from '../services/tray.service';
import { TrayState } from '../../shared/types';

export function registerTrayIpc(trayService: TrayService) {
  ipcMain.handle('tray:update', async (_event, state: TrayState) => {
    trayService.updateState(state);
  });

  ipcMain.handle('tray:get-state', async () => {
    return trayService.getState();
  });
}
