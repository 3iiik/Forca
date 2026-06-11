import { app, ipcMain, shell } from 'electron';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { WebSocketServerService } from '../services/websocket-server.service';
import { deployExtension, getExtensionIdentity, openStoreUrl } from '../services/extension-deploy.service';

const BROWSER_PATHS: Record<string, string[]> = {
  chrome: [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
  ],
  brave: [
    'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
  ],
  edge: [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ],
};

function findBrowserExe(browserId: string): string | null {
  const candidates = BROWSER_PATHS[browserId];
  if (!candidates) return null;
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export function registerExtensionIpc(wsServer: WebSocketServerService) {
  ipcMain.handle('extension:get-client-count', async () => {
    return wsServer.getClientCount();
  });

  ipcMain.handle('extension:open-store', async (_event, browser: string) => {
    return openStoreUrl(browser);
  });

  ipcMain.handle('extension:open-folder', async (_event, browser: string) => {
    const folderName = browser === 'firefox' ? 'firefox-release' : 'chrome-release';
    const folderPath = path.join(app.getAppPath(), 'browser-extension', folderName);
    try {
      await shell.openPath(folderPath);
      return { success: true, details: `Opened ${folderName}/` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, details: msg };
    }
  });

  ipcMain.handle('extension:launch-with-extension', async (_event, browserId: string) => {
    const exePath = findBrowserExe(browserId);
    if (!exePath) {
      return { success: false, details: `Could not find ${browserId} executable. Please install ${browserId} first.` };
    }
    const extPath = path.join(app.getAppPath(), 'browser-extension', 'chrome-release');
    if (!fs.existsSync(extPath)) {
      return { success: false, details: `Extension folder not found at ${extPath}` };
    }
    try {
      spawn(exePath, [`--load-extension=${extPath}`], { detached: true, stdio: 'ignore' });
      return { success: true, details: `Launched ${browserId} with extension loaded` };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, details: msg };
    }
  });

  ipcMain.handle('extension:deploy', async (_event, browser: string) => {
    const isFirefox = browser === 'firefox';
    return deployExtension(browser, isFirefox);
  });

  ipcMain.handle('extension:identity', async () => {
    return getExtensionIdentity();
  });
}
