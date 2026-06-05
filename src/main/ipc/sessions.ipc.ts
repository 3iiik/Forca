import { ipcMain } from 'electron';
import store from '../store/store';

export function registerSessionsIpc() {
  ipcMain.handle('sessions:list', async (_event, date: string) => {
    const sessions = store.get('sessions', []);
    return sessions.filter((s: any) => s.date === date);
  });

  ipcMain.handle('sessions:all', async () => {
    return store.get('sessions', []);
  });

  ipcMain.handle('sessions:save', async (_event, session: any) => {
    const sessions = store.get('sessions', []);
    sessions.push(session);
    store.set('sessions', sessions);
  });
}
