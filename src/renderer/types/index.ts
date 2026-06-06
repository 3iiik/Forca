declare global {
  interface Window {
    electronAPI: {
      calendar: {
        auth: () => Promise<boolean>;
        getEvents: (date: string) => Promise<import('../../shared/types').CalendarEvent[]>;
        checkMeetingEnd: () => Promise<import('../../shared/types').CalendarEvent | null>;
      };
      zone: {
        start: (zoneId: string) => Promise<boolean>;
        stop: () => Promise<void>;
        pause: () => Promise<void>;
        resume: () => Promise<void>;
        list: () => Promise<import('../../shared/types').FocusZone[]>;
        create: (zone: import('../../shared/types').FocusZone) => Promise<import('../../shared/types').FocusZone>;
        update: (zone: import('../../shared/types').FocusZone) => Promise<import('../../shared/types').FocusZone>;
        delete: (zoneId: string) => Promise<void>;
        getActive: () => Promise<import('../../shared/types').ActiveZone | null>;
      };
      blocker: {
        blockApps: (apps: string[]) => Promise<void>;
        unblockApps: () => Promise<void>;
        blockSites: (sites: string[]) => Promise<void>;
        unblockSites: () => Promise<void>;
        getBlockedApps: () => Promise<string[]>;
        getAllowedApps: () => Promise<string[]>;
        setAllowedApps: (apps: string[]) => Promise<void>;
      };
      settings: {
        get: () => Promise<import('../../shared/types').AppSettings>;
        set: (settings: Partial<import('../../shared/types').AppSettings>) => Promise<void>;
        reset: () => Promise<void>;
      };
      sessions: {
        list: (date: string) => Promise<import('../../shared/types').FocusSession[]>;
        all: () => Promise<import('../../shared/types').FocusSession[]>;
        save: (session: import('../../shared/types').FocusSession) => Promise<void>;
      };
      profiles: {
        list: () => Promise<import('../../shared/types').ZoneProfile[]>;
        save: (profile: import('../../shared/types').ZoneProfile) => Promise<void>;
        delete: (profileId: string) => Promise<void>;
      };
      stats: {
        focusScore: () => Promise<import('../../shared/types').FocusScore>;
        weeklySummary: () => Promise<import('../../shared/types').WeeklySummary>;
        streak: () => Promise<import('../../shared/types').StreakData>;
        suggestions: () => Promise<import('../../shared/types').Suggestion[]>;
      };
      sound: {
        play: (sound: import('../../shared/types').AmbientSoundType, volume: number) => Promise<void>;
        stop: () => Promise<void>;
        setVolume: (volume: number) => Promise<void>;
      };
      dnd: {
        enable: () => Promise<void>;
        disable: () => Promise<void>;
      };
      sync: {
        upload: () => Promise<void>;
        download: () => Promise<void>;
        status: () => Promise<{ lastSynced: string; online: boolean }>;
      };
      app: {
        minimize: () => Promise<void>;
        close: () => Promise<void>;
        getVersion: () => Promise<string>;
        checkUpdate: () => Promise<{ available: boolean; version?: string }>;
        installUpdate: () => Promise<void>;
        getOnboardingStatus: () => Promise<boolean>;
        completeOnboarding: () => Promise<void>;
      };
      on: (channel: string, callback: (...args: any[]) => void) => () => void;
      removeAllListeners: (channel: string) => void;
    };
  }
}

export type {
  CalendarEvent,
  FocusZone,
  ZoneTrigger,
  ZoneTriggerType,
  ZoneProfile,
  AmbientSoundType,
  ActiveZone,
  FocusSession,
  FocusScore,
  TrayState,
  BlockedApp,
  AppSettings,
  CalendarSettings,
  NotificationSettings,
  SoundSettings,
  BreakSettings,
  GeneralSettings,
  SyncSettings,
  BreakTimer,
  StreakData,
  WeeklySummary,
  Suggestion,
} from '../../shared/types';
