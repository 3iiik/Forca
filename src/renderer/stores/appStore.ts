import { create } from 'zustand';
import {
  ActiveZone, FocusZone, ZoneProfile, FocusSession,
  FocusScore, StreakData, WeeklySummary, Suggestion,
  CalendarEvent, AppSettings, BreakTimer,
} from '../types';

interface AppStore {
  // Navigation
  currentView: string;
  setCurrentView: (view: string) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Theme
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;

  // Active zone
  activeZone: ActiveZone | null;
  setActiveZone: (zone: ActiveZone | null) => void;

  // Zones
  zones: FocusZone[];
  setZones: (zones: FocusZone[]) => void;

  // Profiles
  profiles: ZoneProfile[];
  setProfiles: (profiles: ZoneProfile[]) => void;

  // Sessions
  sessions: FocusSession[];
  setSessions: (sessions: FocusSession[]) => void;

  // Calendar events
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;

  // Stats
  focusScore: FocusScore;
  setFocusScore: (score: FocusScore) => void;
  weeklySummary: WeeklySummary | null;
  setWeeklySummary: (summary: WeeklySummary) => void;
  streak: StreakData;
  setStreak: (streak: StreakData) => void;
  suggestions: Suggestion[];
  setSuggestions: (suggestions: Suggestion[]) => void;

  // Break timer
  breakTimer: BreakTimer;
  setBreakTimer: (timer: BreakTimer) => void;

  // Settings
  settings: AppSettings | null;
  setSettings: (settings: AppSettings) => void;

  // Notifications
  notification: { title: string; body: string } | null;
  setNotification: (notification: { title: string; body: string } | null) => void;

  // Update
  updateAvailable: { version: string } | null;
  setUpdateAvailable: (update: { version: string } | null) => void;

  // Loading
  loading: boolean;
  setLoading: (loading: boolean) => void;

  // Onboarding
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  currentView: 'today',
  setCurrentView: (view) => set({ currentView: view }),

  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  darkMode: false,
  setDarkMode: (dark) => set({ darkMode: dark }),

  activeZone: null,
  setActiveZone: (zone) => set({ activeZone: zone }),

  zones: [],
  setZones: (zones) => set({ zones }),

  profiles: [],
  setProfiles: (profiles) => set({ profiles }),

  sessions: [],
  setSessions: (sessions) => set({ sessions }),

  events: [],
  setEvents: (events) => set({ events }),

  focusScore: { session: 0, daily: 0, weekly: 0, monthly: 0 },
  setFocusScore: (score) => set({ focusScore: score }),
  weeklySummary: null,
  setWeeklySummary: (summary) => set({ weeklySummary: summary }),
  streak: { currentStreak: 0, longestStreak: 0, lastSessionDate: '', todayCompleted: false },
  setStreak: (streak) => set({ streak }),
  suggestions: [],
  setSuggestions: (suggestions) => set({ suggestions }),

  breakTimer: { isBreak: false, remaining: 0, total: 0 },
  setBreakTimer: (timer) => set({ breakTimer: timer }),

  settings: null,
  setSettings: (settings) => set({ settings }),

  notification: null,
  setNotification: (notification) => set({ notification }),

  updateAvailable: null,
  setUpdateAvailable: (update) => set({ updateAvailable: update }),

  loading: false,
  setLoading: (loading) => set({ loading }),

  onboardingComplete: true,
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
}));
