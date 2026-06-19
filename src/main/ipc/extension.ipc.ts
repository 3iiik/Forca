import { ipcMain } from 'electron';
import { WebSocketServerService } from '../services/websocket-server.service';
import {
  deployExtension,
  getExtensionIdentity,
  openStoreUrl,
  detectChromiumBrowsers,
  openExtensionsPage,
  openExtensionFolder,
  pickBestBrowser,
} from '../services/extension-deploy.service';

export function registerExtensionIpc(wsServer: WebSocketServerService) {
  ipcMain.handle('extension:get-client-count', async () => {
    return wsServer.getClientCount();
  });

  ipcMain.handle('extension:open-store', async (_event, browser: string) => {
    return openStoreUrl(browser);
  });

  ipcMain.handle('extension:detect-browsers', async () => {
    return detectChromiumBrowsers();
  });

  ipcMain.handle('extension:pick-best-browser', async () => {
    const browsers = detectChromiumBrowsers();
    return pickBestBrowser(browsers);
  });

  ipcMain.handle('extension:open-extensions-page', async (_event, browserId: string) => {
    return openExtensionsPage(browserId);
  });

  ipcMain.handle('extension:open-extension-folder', async () => {
    return openExtensionFolder();
  });

  ipcMain.handle('extension:deploy', async (_event, browser: string) => {
    const isFirefox = browser === 'firefox';
    return deployExtension(browser, isFirefox);
  });

  ipcMain.handle('extension:identity', async () => {
    return getExtensionIdentity();
  });

  ipcMain.handle('extension:reconnect', async () => {
    try {
      wsServer.restart();
      const count = wsServer.getClientCount();
      return { success: true, clientCount: count };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  });
}
