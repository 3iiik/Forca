export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  source: 'google' | 'ical';
  calendarName?: string;
}

export interface FocusZone {
  id: string;
  name: string;
  duration: number;
  blockedSites: string[];
  trigger: ZoneTrigger;
  profileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ZoneTriggerType = 'after-meeting' | 'scheduled' | 'manual';

export interface ZoneTrigger {
  type: ZoneTriggerType;
  scheduledTime?: string;
  afterMeetingDelay?: number;
}

export interface ZoneProfile {
  id: string;
  name: string;
  icon: string;
  blockedSites: string[];
  ambientSound: AmbientSoundType | null;
  ambientVolume: number;
  timerStyle: 'countdown' | 'stopwatch';
  defaultDuration: number;
}

export type AmbientSoundType = 'rain' | 'white-noise' | 'forest' | 'none';

export interface ActiveZone {
  zoneId: string;
  zoneName: string;
  profileId?: string;
  startTime: Date;
  endTime: Date;
  remaining: number;
  status: 'running' | 'paused' | 'ending';
  ambientSound: AmbientSoundType;
  ambientVolume: number;
}

export interface FocusSession {
  id: string;
  zoneId: string;
  zoneName: string;
  profileName?: string;
  startTime: Date;
  endTime: Date;
  durationCompleted: number;
  durationPlanned: number;
  interruptions: number;
  score: number;
  date: string;
}

export interface FocusScore {
  session: number;
  daily: number;
  weekly: number;
  monthly: number;
}

export interface TrayState {
  status: 'idle' | 'active' | 'paused' | 'meeting-soon';
  activeZoneName?: string;
  remaining?: number;
}

export interface AppSettings {
  calendar: CalendarSettings;
  defaultZoneId: string;
  notifications: NotificationSettings;
  sounds: SoundSettings;
  breakReminder: BreakSettings;
  general: GeneralSettings;
  sync: SyncSettings;
}

export interface CalendarSettings {
  provider: 'google' | 'ical' | 'none';
  icalUrl: string;
  googleCalendarId: string;
  googleAccessToken: string;
  googleRefreshToken: string;
  syncEnabled: boolean;
  syncInterval: number;
}

export interface NotificationSettings {
  zoneStart: boolean;
  zoneEnd: boolean;
  meetingSoon: boolean;
  breakReminder: boolean;
  streakRisk: boolean;
  milestone: boolean;
}

export interface SoundSettings {
  enabled: boolean;
  defaultSound: AmbientSoundType;
  defaultVolume: number;
  fadeOutDuration: number;
}

export interface BreakSettings {
  enabled: boolean;
  focusDuration: number;
  breakDuration: number;
  autoStartBreak: boolean;
}

export interface GeneralSettings {
  autoLaunch: boolean;
  launchMinimized: boolean;
  minimizeToTray: boolean;
  closeToTray: boolean;
  darkMode: 'system' | 'light' | 'dark';
  dndSync: boolean;
}

export interface SyncSettings {
  enabled: boolean;
  provider: 'firebase' | 'supabase' | 'none';
  firebaseConfig: FirebaseConfig | null;
  lastSynced: string;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface BreakTimer {
  isBreak: boolean;
  remaining: number;
  total: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string;
  todayCompleted: boolean;
}

export interface WeeklySummary {
  weekStart: string;
  totalDeepWorkHours: number;
  mostProductiveDay: string;
  averageZoneLength: number;
  totalSessions: number;
  bestScore: number;
}

export interface Suggestion {
  id: string;
  type: 'focus-time' | 'recovery-break' | 'schedule-optimization';
  title: string;
  description: string;
  suggestedTime?: string;
  suggestedDuration?: number;
  confidence: number;
}

export interface SyncPayload {
  settings: Partial<AppSettings>;
  sessions: FocusSession[];
  profiles: ZoneProfile[];
  streaks: StreakData;
  lastSynced: string;
}

export interface IpcChannels {
  'calendar:auth': () => Promise<boolean>;
  'calendar:events': (date: string) => Promise<CalendarEvent[]>;
  'calendar:check-meeting-end': () => Promise<CalendarEvent | null>;
  'zone:start': (zoneId: string) => Promise<boolean>;
  'zone:stop': () => Promise<void>;
  'zone:pause': () => Promise<void>;
  'zone:resume': () => Promise<void>;
  'zone:list': () => Promise<FocusZone[]>;
  'zone:create': (zone: FocusZone) => Promise<FocusZone>;
  'zone:update': (zone: FocusZone) => Promise<FocusZone>;
  'zone:delete': (zoneId: string) => Promise<void>;
  'zone:get-active': () => Promise<ActiveZone | null>;
  'blocker:block-sites': (sites: string[]) => Promise<void>;
  'blocker:unblock-sites': () => Promise<void>;
  'blocker:get-blocked-sites': () => Promise<string[]>;
  'tray:update': (state: TrayState) => Promise<void>;
  'tray:get-state': () => Promise<TrayState>;
  'settings:get': () => Promise<AppSettings>;
  'settings:set': (settings: Partial<AppSettings>) => Promise<void>;
  'settings:reset': () => Promise<void>;
  'sessions:list': (date: string) => Promise<FocusSession[]>;
  'sessions:all': () => Promise<FocusSession[]>;
  'sessions:save': (session: FocusSession) => Promise<void>;
  'profiles:list': () => Promise<ZoneProfile[]>;
  'profiles:save': (profile: ZoneProfile) => Promise<void>;
  'profiles:delete': (profileId: string) => Promise<void>;
  'stats:focus-score': () => Promise<FocusScore>;
  'stats:weekly-summary': () => Promise<WeeklySummary>;
  'stats:streak': () => Promise<StreakData>;
  'stats:suggestions': () => Promise<Suggestion[]>;
  'sound:play': (sound: AmbientSoundType, volume: number) => Promise<void>;
  'sound:stop': () => Promise<void>;
  'sound:volume': (volume: number) => Promise<void>;
  'dnd:enable': () => Promise<void>;
  'dnd:disable': () => Promise<void>;
  'sync:upload': () => Promise<void>;
  'sync:download': () => Promise<void>;
  'sync:status': () => Promise<{ lastSynced: string; online: boolean }>;
  'app:minimize': () => Promise<void>;
  'app:close': () => Promise<void>;
  'app:get-version': () => Promise<string>;
  'app:check-update': () => Promise<{ available: boolean; version?: string }>;
  'app:install-update': () => Promise<void>;
}
