import { ipcMain } from 'electron';
import store from '../store/store';

export function registerProfilesIpc() {
  ipcMain.handle('profiles:list', async () => {
    return store.get('profiles', []);
  });

  ipcMain.handle('profiles:save', async (_event, profile: import('../../shared/types').ZoneProfile) => {
    const profiles = store.get('profiles', []);
    const idx = profiles.findIndex((p: import('../../shared/types').ZoneProfile) => p.id === profile.id);
    if (idx !== -1) profiles[idx] = profile;
    else profiles.push(profile);
    store.set('profiles', profiles);
  });

  ipcMain.handle('profiles:delete', async (_event, profileId: string) => {
    const profiles = store.get('profiles', []);
    store.set('profiles', profiles.filter((p: import('../../shared/types').ZoneProfile) => p.id !== profileId));
  });
}
