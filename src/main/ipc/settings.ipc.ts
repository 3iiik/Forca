import { ipcMain } from 'electron';
import store from '../store/store';
import { AppSettings } from '../../shared/types';

function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as (keyof T)[]) {
    const val = source[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && typeof target[key] === 'object' && !Array.isArray(target[key])) {
      result[key] = deepMerge(target[key] as any, val as any);
    } else if (val !== undefined) {
      (result as any)[key] = val;
    }
  }
  return result;
}

export function registerSettingsIpc() {
  ipcMain.handle('settings:get', async () => {
    return store.get('settings');
  });

  ipcMain.handle('settings:set', async (_event, partial: Partial<AppSettings>) => {
    const current = store.get('settings');
    store.set('settings', deepMerge(current, partial));
  });

  ipcMain.handle('settings:reset', async () => {
    store.delete('settings');
  });
}
