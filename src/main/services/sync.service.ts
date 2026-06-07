import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import store from '../store/store';
import { SyncPayload } from '../../shared/types';
import { logger } from '../utils/logger';

export class SyncService {
  private app: ReturnType<typeof initializeApp> | null = null;
  private db: ReturnType<typeof getFirestore> | null = null;
  private user: { uid: string } | null = null;
  private initialized = false;

  async init(): Promise<boolean> {
    const settings = store.get('settings');
    if (!settings.sync.enabled || !settings.sync.firebaseConfig) return false;

    try {
      this.app = initializeApp(settings.sync.firebaseConfig);
      const auth = getAuth(this.app);
      this.user = await signInAnonymously(auth).then((cred: { user: { uid: string } }) => cred.user);
      this.db = getFirestore(this.app);
      this.initialized = true;
      return true;
    } catch (err) {
      logger.error('Sync init failed:', err);
      return false;
    }
  }

  async upload(): Promise<void> {
    if (!this.initialized || !this.db || !this.user) {
      const ok = await this.init();
      if (!ok) return;
    }

    try {
      const payload: SyncPayload = {
        settings: store.get('settings'),
        sessions: store.get('sessions', []),
        profiles: store.get('profiles', []),
        streaks: {
          currentStreak: store.get('currentStreak', 0),
          longestStreak: store.get('longestStreak', 0),
          lastSessionDate: store.get('streakLastDate', ''),
          todayCompleted: false,
        },
        lastSynced: new Date().toISOString(),
      };

      if (this.db && this.user) {
        await setDoc(doc(this.db, 'users', this.user.uid, 'data', 'sync'), payload);
        store.set('settings', {
          ...store.get('settings'),
          sync: { ...store.get('settings').sync, lastSynced: new Date().toISOString() },
        });
      }
    } catch (err) {
      logger.error('Sync upload failed:', err);
    }
  }

  async download(): Promise<void> {
    if (!this.initialized || !this.db || !this.user) {
      const ok = await this.init();
      if (!ok) return;
    }

    try {
      if (this.db && this.user) {
        const docSnap = await getDoc(doc(this.db, 'users', this.user.uid, 'data', 'sync'));
        if (docSnap.exists()) {
          const data = docSnap.data() as SyncPayload;

          // Merge sessions (deduplicate by id)
          const localSessions = store.get('sessions', []);
          const remoteSessions = data.sessions || [];
          const sessionMap = new Map<string, import('../../shared/types').FocusSession>();
          for (const s of [...localSessions, ...remoteSessions]) {
            sessionMap.set(s.id, s);
          }
          store.set('sessions', Array.from(sessionMap.values()));

          // Merge settings
          if (data.settings) {
            // Partial merge - don't override local settings completely
            const currentSettings = store.get('settings');
            store.set('settings', { ...currentSettings, ...data.settings });
          }

          // Merge streaks
          if (data.streaks) {
            const localStreak = store.get('currentStreak', 0);
            const remoteStreak = data.streaks.currentStreak || 0;
            store.set('currentStreak', Math.max(localStreak, remoteStreak));
            store.set('longestStreak', Math.max(
              store.get('longestStreak', 0),
              data.streaks.longestStreak || 0
            ));
          }
        }
      }
    } catch (err) {
      logger.error('Sync download failed:', err);
    }
  }

  getStatus(): { lastSynced: string; online: boolean } {
    const settings = store.get('settings');
    return {
      lastSynced: settings.sync.lastSynced || 'Never',
      online: this.initialized,
    };
  }

  destroy(): void {
    this.initialized = false;
    this.db = null;
    this.user = null;
    this.app = null;
  }
}
