import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import store from '../store/store';
import { SyncPayload } from '../../shared/types';

export class SyncService {
  private app: any = null;
  private db: any = null;
  private user: any = null;
  private initialized = false;

  async init(): Promise<boolean> {
    const settings = store.get('settings');
    if (!settings.sync.enabled || !settings.sync.firebaseConfig) return false;

    try {
      this.app = initializeApp(settings.sync.firebaseConfig);
      const auth = getAuth(this.app);
      this.user = await signInAnonymously(auth).then((cred: any) => cred.user);
      this.db = getFirestore(this.app);
      this.initialized = true;
      return true;
    } catch (err) {
      console.error('Sync init failed:', err);
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
        settings: {
          zones: store.get('zones', []),
          profiles: store.get('profiles', []),
          ...store.get('settings'),
        } as any,
        sessions: store.get('sessions', []) as any,
        profiles: store.get('profiles', []) as any,
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
      console.error('Sync upload failed:', err);
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
          const sessionMap = new Map<string, any>();
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
      console.error('Sync download failed:', err);
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
