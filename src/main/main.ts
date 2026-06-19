import { app, BrowserWindow, Menu, Notification } from 'electron';
import * as path from 'path';
import * as os from 'os';
import { autoUpdater } from 'electron-updater';

import store from './store/store';
import { ZoneEngine } from './services/zone-engine.service';
import { CalendarService } from './services/calendar.service';
import { BlockingService } from './services/blocker.service';
import { TrayService } from './services/tray.service';
import { DndService } from './services/dnd.service';
import { SoundService } from './services/sound.service';
import { SuggestionService } from './services/suggestion.service';
import { ScoreService } from './services/score.service';
import { SyncService } from './services/sync.service';
import { UpdaterService } from './services/updater.service';
import { WebSocketServerService } from './services/websocket-server.service';
import { setExtensionDir } from './services/extension-deploy.service';
import { logger } from './utils/logger';

import { registerCalendarIpc } from './ipc/calendar.ipc';
import { registerZoneIpc } from './ipc/zone.ipc';
import { registerBlockerIpc } from './ipc/blocker.ipc';
import { registerTrayIpc } from './ipc/tray.ipc';
import { registerSettingsIpc } from './ipc/settings.ipc';
import { registerStatsIpc } from './ipc/stats.ipc';
import { registerSoundIpc } from './ipc/sound.ipc';
import { registerDndIpc } from './ipc/dnd.ipc';
import { registerSessionsIpc } from './ipc/sessions.ipc';
import { registerProfilesIpc } from './ipc/profiles.ipc';
import { registerSyncIpc } from './ipc/sync.ipc';
import { registerAppIpc } from './ipc/app.ipc';
import { registerExtensionIpc } from './ipc/extension.ipc';
import { registerAnalyticsIpc } from './ipc/analytics.ipc';

let mainWindow: BrowserWindow | null = null;

// Services
const blockerService = new BlockingService();
const trayService = new TrayService();
const dndService = new DndService();
const soundService = new SoundService();
const wsServer = new WebSocketServerService();
const zoneEngine = new ZoneEngine(blockerService, trayService, dndService, soundService, wsServer);
const calendarService = new CalendarService();
const suggestionService = new SuggestionService();
const scoreService = new ScoreService();
const syncService = new SyncService();
const updaterService = new UpdaterService();

function createWindow() {
  Menu.setApplicationMenu(null);

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    frame: true,
    show: false,
    icon: path.join(__dirname, '..', '..', 'assets', 'icons', 'icon.png'),
	autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: true,
    },
  });

  Menu.setApplicationMenu(null);

  mainWindow.setMenuBarVisibility(false);
  mainWindow.autoHideMenuBar = true;

  // In development, load from Vite dev server
  const isDev = process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Lower power when hidden
  mainWindow.on('hide', () => {
    mainWindow?.webContents.setBackgroundThrottling(true);
  });
  mainWindow.on('show', () => {
    mainWindow?.webContents.setBackgroundThrottling(false);
  });

  mainWindow.on('close', (event) => {
    const settings = store.get('settings');
    if (settings.general.closeToTray) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up services with window reference
  zoneEngine.setWindow(mainWindow);
  calendarService.setWindow(mainWindow);
  blockerService.setWindow(mainWindow);
  trayService.setWindow(mainWindow);
  soundService.setWindow(mainWindow);
  updaterService.setWindow(mainWindow);

  // Set up zone engine callbacks
  zoneEngine.setCallbacks({
    onUpdate: (zone) => {
      mainWindow?.webContents.send('zone:updated', zone);
    },
    onBreakUpdate: (isBreak, remaining, total) => {
      mainWindow?.webContents.send('break:update', { isBreak, remaining, total });
    },
  });

  // Provide catch-up state for newly connecting WebSocket clients
  wsServer.getActiveZoneState = () => {
    const active = zoneEngine.getActiveZone();
    if (!active) return null;
    const zones = zoneEngine.getZones();
    const zone = zones.find(z => z.id === active.zoneId);
    return {
      sites: zone?.blockedSites || [],
      zoneName: active.zoneName,
      remaining: active.remaining,
    };
  };

  // Forward client commands from the browser extension to the zone engine
  wsServer.onClientCommand = (command, _payload) => {
    switch (command) {
      case 'pause':
        zoneEngine.pauseZone();
        break;
      case 'resume':
        zoneEngine.resumeZone();
        break;
      case 'end':
        zoneEngine.stopZone();
        break;
    }
  };

  // Set up calendar callbacks
  calendarService.setCallbacks({
    onMeetingEnd: (event) => {
      mainWindow?.webContents.send('calendar:meeting-ended', event);
      // Auto-trigger focus zone after meeting
      const zones = zoneEngine.getZones();
      const afterMeetingZone = zones.find(
        z => z.trigger.type === 'after-meeting'
      );
      if (afterMeetingZone) {
        const delay = afterMeetingZone.trigger.afterMeetingDelay || 0;
        setTimeout(() => {
          zoneEngine.startZone(afterMeetingZone.id);
        }, delay * 1000);
      }
    },
  });

  // Register all IPC handlers
  registerCalendarIpc(calendarService);
  registerZoneIpc(zoneEngine);
  registerBlockerIpc(blockerService);
  registerTrayIpc(trayService);
  registerSettingsIpc();
  registerStatsIpc(scoreService, suggestionService, calendarService);
  registerSoundIpc(soundService);
  registerDndIpc(dndService);
  registerSessionsIpc();
  registerProfilesIpc();
  registerSyncIpc(syncService);
  registerAppIpc(updaterService);
  registerExtensionIpc(wsServer);
  registerAnalyticsIpc();

  // Setup tray
  setupTray();

  // Start meeting monitor
  calendarService.startMeetingMonitor();

  // ── Auto-updater ──────────────────────────────
  autoUpdater.autoDownload = false;

  const isProd = process.env.NODE_ENV === 'production' && !process.env.VITE_DEV_SERVER_URL;

  autoUpdater.on('checking-for-update', () => {
    if (!isProd) logger.info('[updater] checking for updates');
  });

  autoUpdater.on('update-available', (info) => {
    if (!isProd) logger.info(`[updater] update available: v${info.version}`);
    mainWindow?.webContents.send('update:available', {
      version: info.version,
      releaseDate: info.releaseDate,
    });
  });

  autoUpdater.on('update-not-available', () => {
    if (!isProd) logger.info('[updater] no update available');
  });

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('update:progress', {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
    });
  });

  autoUpdater.on('update-downloaded', () => {
    if (!isProd) logger.info('[updater] update downloaded');
    mainWindow?.webContents.send('update:downloaded');

    // Show native notification prompting restart
    const notif = new Notification({
      title: 'Forca Update Ready',
      body: 'A new version has been downloaded. Restart Forca to install it.',
    });
    notif.on('click', () => {
      autoUpdater.quitAndInstall();
    });
    notif.show();
  });

  autoUpdater.on('error', (err) => {
    logger.error('[updater] error:', err.message);
  });

  updaterService.init();
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify();
    updaterService.checkForUpdates();
  }, 30000);

  // Setup auto-launch
  setupAutoLaunch();
}

function setupTray() {
  trayService.setWindow(mainWindow!);
  trayService.setCallbacks({
    onStartFocus: () => {
      mainWindow?.show();
      mainWindow?.webContents.send('tray:action', 'start-focus');
    },
    onPause: () => {
      zoneEngine.pauseZone();
    },
    onResume: () => {
      zoneEngine.resumeZone();
    },
    onSkip: () => {
      zoneEngine.stopZone();
    },
    onShowSchedule: () => {
      mainWindow?.show();
      mainWindow?.webContents.send('tray:action', 'show-schedule');
    },
    onOpenSettings: () => {
      mainWindow?.show();
      mainWindow?.webContents.send('tray:action', 'open-settings');
    },
    onQuit: () => {
      app.quit();
    },
  });
  trayService.init();
}

function setupAutoLaunch() {
  const settings = store.get('settings');
  if (settings.general.autoLaunch) {
    app.setLoginItemSettings({
      openAtLogin: true,
      path: app.getPath('exe'),
    });
  }
}

// ── Optimizations ──────────────────────────
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=256 --code-cache');

// Lower process priority so Forca never competes with user's main apps
function lowerProcessPriority() {
  try {
    if (process.platform === 'win32') {
      os.setPriority(0, 19);
    } else if (process.platform === 'darwin' || process.platform === 'linux') {
      os.setPriority(0, 10);
    }
  } catch {
    // May not have permission, that's fine
  }
}
lowerProcessPriority();

// macOS: hide dock icon by default (menu bar app)
if (process.platform === 'darwin') {
  app.dock?.hide();
}

app.whenReady().then(async () => {
  // Resolve extension directory for deploy service
  // In dev: relative to project root; in production: shipped alongside app resources
  const extDir = path.join(app.getAppPath(), 'browser-extension');
  setExtensionDir(extDir);

  wsServer.start();
  createWindow();

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    } else {
      mainWindow.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  zoneEngine.destroy();
  calendarService.destroy();
  blockerService.cleanup();
  trayService.destroy();
  syncService.destroy();
  wsServer.stop();
});
