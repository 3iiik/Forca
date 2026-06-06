import Store from 'electron-store';
import { AppSettings, FocusZone, ZoneProfile, FocusSession } from '../../shared/types';

interface StoreSchema {
  settings: AppSettings;
  zones: FocusZone[];
  profiles: ZoneProfile[];
  sessions: FocusSession[];
  streakLastDate: string;
  currentStreak: number;
  longestStreak: number;
  alwaysAllowedApps: string[];
  onboardingComplete: boolean;
}

const defaults: StoreSchema = {
  settings: {
    calendar: {
      provider: 'none',
      icalUrl: '',
      googleCalendarId: '',
      googleAccessToken: '',
      googleRefreshToken: '',
      syncEnabled: false,
      syncInterval: 5,
    },
    defaultZoneId: '',
    notifications: {
      zoneStart: true,
      zoneEnd: true,
      meetingSoon: true,
      breakReminder: true,
      streakRisk: true,
      milestone: true,
    },
    sounds: {
      enabled: true,
      defaultSound: 'rain',
      defaultVolume: 50,
      fadeOutDuration: 3,
    },
    breakReminder: {
      enabled: true,
      focusDuration: 50,
      breakDuration: 10,
      autoStartBreak: false,
    },
    general: {
      autoLaunch: false,
      launchMinimized: false,
      minimizeToTray: true,
      closeToTray: true,
      darkMode: 'system',
      dndSync: false,
    },
    sync: {
      enabled: false,
      provider: 'none',
      firebaseConfig: null,
      lastSynced: '',
    },
  },
  zones: [],
  profiles: [],
  sessions: [],
  alwaysAllowedApps: ['Code', 'Figma', 'GitHub Desktop', 'Notion', 'Spotify'],
  streakLastDate: '',
  currentStreak: 0,
  longestStreak: 0,
  onboardingComplete: false,
};

const store = new Store<StoreSchema>({ defaults });

export default store;
