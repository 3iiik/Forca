import { ipcMain } from 'electron';
import store from '../store/store';

const MAX_SESSION_AGE_DAYS = 90;

function pruneOldSessions(): void {
  const sessions = store.get('sessions', []);
  if (sessions.length === 0) return;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_SESSION_AGE_DAYS);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  const pruned = sessions.filter((s: any) => s.date >= cutoffStr);
  if (pruned.length < sessions.length) {
    store.set('sessions', pruned);
  }
}

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
    pruneOldSessions();
  });
}
