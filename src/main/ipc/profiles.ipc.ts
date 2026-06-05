import { ipcMain } from 'electron';
import store from '../store/store';

export function registerProfilesIpc() {
  ipcMain.handle('profiles:list', async () => {
    return store.get('profiles', []);
  });

  ipcMain.handle('profiles:save', async (_event, profile: any) => {
    const profiles = store.get('profiles', []);
    const idx = profiles.findIndex((p: any) => p.id === profile.id);
    if (idx !== -1) profiles[idx] = profile;
    else profiles.push(profile);
    store.set('profiles', profiles);
  });

  ipcMain.handle('profiles:delete', async (_event, profileId: string) => {
    const profiles = store.get('profiles', []);
    store.set('profiles', profiles.filter((p: any) => p.id !== profileId));
  });
}
