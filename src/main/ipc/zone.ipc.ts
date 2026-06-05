import { ipcMain } from 'electron';
import { ZoneEngine } from '../services/zone-engine.service';
import { FocusZone } from '../../shared/types';

export function registerZoneIpc(zoneEngine: ZoneEngine) {
  ipcMain.handle('zone:start', async (_event, zoneId: string) => {
    return zoneEngine.startZone(zoneId);
  });

  ipcMain.handle('zone:stop', async () => {
    await zoneEngine.stopZone();
  });

  ipcMain.handle('zone:pause', async () => {
    zoneEngine.pauseZone();
  });

  ipcMain.handle('zone:resume', async () => {
    zoneEngine.resumeZone();
  });

  ipcMain.handle('zone:list', async () => {
    return zoneEngine.getZones();
  });

  ipcMain.handle('zone:create', async (_event, zone: FocusZone) => {
    return zoneEngine.createZone(zone);
  });

  ipcMain.handle('zone:update', async (_event, zone: FocusZone) => {
    return zoneEngine.updateZone(zone);
  });

  ipcMain.handle('zone:delete', async (_event, zoneId: string) => {
    zoneEngine.deleteZone(zoneId);
  });

  ipcMain.handle('zone:get-active', async () => {
    return zoneEngine.getActiveZone();
  });
}
