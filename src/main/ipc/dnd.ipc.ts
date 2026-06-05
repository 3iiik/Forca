import { ipcMain } from 'electron';
import { DndService } from '../services/dnd.service';

export function registerDndIpc(dndService: DndService) {
  ipcMain.handle('dnd:enable', async () => {
    await dndService.enable();
  });

  ipcMain.handle('dnd:disable', async () => {
    await dndService.disable();
  });
}
