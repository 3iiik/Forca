import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // Calendar
  calendar: {
    auth: () => ipcRenderer.invoke('calendar:auth'),
    getEvents: (date: string) => ipcRenderer.invoke('calendar:events', date),
    checkMeetingEnd: () => ipcRenderer.invoke('calendar:check-meeting-end'),
  },

  // Zones
  zone: {
    start: (zoneId: string) => ipcRenderer.invoke('zone:start', zoneId),
    stop: () => ipcRenderer.invoke('zone:stop'),
    pause: () => ipcRenderer.invoke('zone:pause'),
    resume: () => ipcRenderer.invoke('zone:resume'),
    list: () => ipcRenderer.invoke('zone:list'),
    create: (zone: import('../shared/types').FocusZone) => ipcRenderer.invoke('zone:create', zone),
    update: (zone: import('../shared/types').FocusZone) => ipcRenderer.invoke('zone:update', zone),
    delete: (zoneId: string) => ipcRenderer.invoke('zone:delete', zoneId),
    getActive: () => ipcRenderer.invoke('zone:get-active'),
  },

  // Blocker
  blocker: {
    blockSites: (sites: string[]) => ipcRenderer.invoke('blocker:block-sites', sites),
    unblockSites: () => ipcRenderer.invoke('blocker:unblock-sites'),
    getBlockedSites: () => ipcRenderer.invoke('blocker:get-blocked-sites'),
  },

  // Settings
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (settings: import('../shared/types').AppSettings) => ipcRenderer.invoke('settings:set', settings),
    reset: () => ipcRenderer.invoke('settings:reset'),
  },

  // Sessions
  sessions: {
    list: (date: string) => ipcRenderer.invoke('sessions:list', date),
    all: () => ipcRenderer.invoke('sessions:all'),
    save: (session: import('../shared/types').FocusSession) => ipcRenderer.invoke('sessions:save', session),
  },

  // Profiles
  profiles: {
    list: () => ipcRenderer.invoke('profiles:list'),
    save: (profile: import('../shared/types').ZoneProfile) => ipcRenderer.invoke('profiles:save', profile),
    delete: (profileId: string) => ipcRenderer.invoke('profiles:delete', profileId),
  },

  // Stats
  stats: {
    focusScore: () => ipcRenderer.invoke('stats:focus-score'),
    weeklySummary: () => ipcRenderer.invoke('stats:weekly-summary'),
    streak: () => ipcRenderer.invoke('stats:streak'),
    suggestions: () => ipcRenderer.invoke('stats:suggestions'),
  },

  // Sound
  sound: {
    play: (sound: string, volume: number) => ipcRenderer.invoke('sound:play', sound, volume),
    stop: () => ipcRenderer.invoke('sound:stop'),
    setVolume: (volume: number) => ipcRenderer.invoke('sound:volume', volume),
  },

  // DND
  dnd: {
    enable: () => ipcRenderer.invoke('dnd:enable'),
    disable: () => ipcRenderer.invoke('dnd:disable'),
  },

  // Sync
  sync: {
    upload: () => ipcRenderer.invoke('sync:upload'),
    download: () => ipcRenderer.invoke('sync:download'),
    status: () => ipcRenderer.invoke('sync:status'),
  },

  // Extension
  extension: {
    deploy: (browser: string) => ipcRenderer.invoke('extension:deploy', browser),
    getIdentity: () => ipcRenderer.invoke('extension:identity'),
    getClientCount: () => ipcRenderer.invoke('extension:get-client-count'),
    openStore: (browser: string) => ipcRenderer.invoke('extension:open-store', browser),
    openFolder: (browser: string) => ipcRenderer.invoke('extension:open-folder', browser),
    launchWithExtension: (browser: string) => ipcRenderer.invoke('extension:launch-with-extension', browser),
    reconnect: () => ipcRenderer.invoke('extension:reconnect'),
  },

  // App
  app: {
    minimize: () => ipcRenderer.invoke('app:minimize'),
    close: () => ipcRenderer.invoke('app:close'),
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    checkUpdate: () => ipcRenderer.invoke('app:check-update'),
    installUpdate: () => ipcRenderer.invoke('app:install-update'),
    getOnboardingStatus: () => ipcRenderer.invoke('app:get-onboarding-status'),
    completeOnboarding: () => ipcRenderer.invoke('app:complete-onboarding'),
  },

  // Event listeners
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = [
      'zone:updated', 'break:update', 'calendar:meeting-ended',
      'tray:action', 'update:available', 'update:progress',
      'update:downloaded', 'notification:show',
      'sound:play', 'sound:stop', 'sound:volume', 'sound:fade-out',
    ];
    if (validChannels.includes(channel)) {
      const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    return () => {};
  },

  // Remove all listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

export type ElectronAPI = typeof api;
