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
    create: (zone: any) => ipcRenderer.invoke('zone:create', zone),
    update: (zone: any) => ipcRenderer.invoke('zone:update', zone),
    delete: (zoneId: string) => ipcRenderer.invoke('zone:delete', zoneId),
    getActive: () => ipcRenderer.invoke('zone:get-active'),
  },

  // Blocker
  blocker: {
    blockApps: (apps: string[]) => ipcRenderer.invoke('blocker:block-apps', apps),
    unblockApps: () => ipcRenderer.invoke('blocker:unblock-apps'),
    blockSites: (sites: string[]) => ipcRenderer.invoke('blocker:block-sites', sites),
    unblockSites: () => ipcRenderer.invoke('blocker:unblock-sites'),
    getBlockedApps: () => ipcRenderer.invoke('blocker:get-blocked-apps'),
    getAllowedApps: () => ipcRenderer.invoke('blocker:get-allowed-apps'),
    setAllowedApps: (apps: string[]) => ipcRenderer.invoke('blocker:set-allowed-apps', apps),
  },

  // Settings
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (settings: any) => ipcRenderer.invoke('settings:set', settings),
    reset: () => ipcRenderer.invoke('settings:reset'),
  },

  // Sessions
  sessions: {
    list: (date: string) => ipcRenderer.invoke('sessions:list', date),
    all: () => ipcRenderer.invoke('sessions:all'),
    save: (session: any) => ipcRenderer.invoke('sessions:save', session),
  },

  // Profiles
  profiles: {
    list: () => ipcRenderer.invoke('profiles:list'),
    save: (profile: any) => ipcRenderer.invoke('profiles:save', profile),
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

  // App
  app: {
    minimize: () => ipcRenderer.invoke('app:minimize'),
    close: () => ipcRenderer.invoke('app:close'),
    getVersion: () => ipcRenderer.invoke('app:get-version'),
    checkUpdate: () => ipcRenderer.invoke('app:check-update'),
    installUpdate: () => ipcRenderer.invoke('app:install-update'),
  },

  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      'zone:updated', 'break:update', 'calendar:meeting-ended',
      'tray:action', 'update:available', 'update:progress',
      'update:downloaded', 'notification:show', 'blocker:app-blocked',
      'sound:play', 'sound:stop', 'sound:volume', 'sound:fade-out',
    ];
    if (validChannels.includes(channel)) {
      const subscription = (_event: Electron.IpcRendererEvent, ...args: any[]) => callback(...args);
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
