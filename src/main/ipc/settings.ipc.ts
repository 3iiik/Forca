import { ipcMain } from 'electron';
import store from '../store/store';
import { AppSettings } from '../../shared/types';

export function registerSettingsIpc() {
  ipcMain.handle('settings:get', async () => {
    return store.get('settings');
  });

  ipcMain.handle('settings:set', async (_event, partial: Partial<AppSettings>) => {
    const current = store.get('settings');
    store.set('settings', { ...current, ...partial });
  });

  ipcMain.handle('settings:reset', async () => {
    store.delete('settings');
  });
}
