import { app, shell } from 'electron';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface DeployResult {
  method: 'store-url' | 'none';
  success: boolean;
  details: string;
}

export interface DetectedBrowser {
  id: string;
  name: string;
  exePath: string;
  extensionsUrl: string;
}

const CHROME_EXTENSION_ID = 'kgklifcallapplgnjipeloiaocgalhco';
const FIREFOX_EXTENSION_ID = 'forca-focus@forca.app';

let extensionDir: string;

const KNOWN_BROWSERS: Record<string, { name: string; paths: string[]; extensionsUrl: string }> = {
  chrome: {
    name: 'Google Chrome',
    paths: [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium-browser',
    ],
    extensionsUrl: 'chrome://extensions',
  },
  edge: {
    name: 'Microsoft Edge',
    paths: [
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
      '/usr/bin/microsoft-edge',
    ],
    extensionsUrl: 'edge://extensions',
  },
  brave: {
    name: 'Brave',
    paths: [
      'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
      `${process.env.LOCALAPPDATA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`,
      '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
      '/usr/bin/brave-browser',
    ],
    extensionsUrl: 'brave://extensions',
  },
  arc: {
    name: 'Arc',
    paths: [
      `${process.env.LOCALAPPDATA}\\Arc\\Application\\arc.exe`,
      '/Applications/Arc.app/Contents/MacOS/Arc',
    ],
    extensionsUrl: 'chrome://extensions',
  },
  vivaldi: {
    name: 'Vivaldi',
    paths: [
      'C:\\Program Files\\Vivaldi\\Application\\vivaldi.exe',
      `${process.env.LOCALAPPDATA}\\Vivaldi\\Application\\vivaldi.exe`,
      '/Applications/Vivaldi.app/Contents/MacOS/Vivaldi',
      '/usr/bin/vivaldi',
    ],
    extensionsUrl: 'vivaldi://extensions',
  },
  opera: {
    name: 'Opera',
    paths: [
      'C:\\Program Files\\Opera\\launcher.exe',
      `${process.env.LOCALAPPDATA}\\Programs\\Opera\\launcher.exe`,
      '/Applications/Opera.app/Contents/MacOS/Opera',
      '/usr/bin/opera',
    ],
    extensionsUrl: 'opera://extensions',
  },
};

export function setExtensionDir(dir: string) {
  extensionDir = dir;
}

const BROWSER_PRIORITY = ['chrome', 'edge', 'brave', 'arc', 'vivaldi', 'opera'];

export function detectChromiumBrowsers(): DetectedBrowser[] {
  const found: DetectedBrowser[] = [];
  for (const [id, info] of Object.entries(KNOWN_BROWSERS)) {
    for (const p of info.paths) {
      if (fs.existsSync(p)) {
        found.push({ id, name: info.name, exePath: p, extensionsUrl: info.extensionsUrl });
        break;
      }
    }
  }
  found.sort((a, b) => BROWSER_PRIORITY.indexOf(a.id) - BROWSER_PRIORITY.indexOf(b.id));
  return found;
}

export function pickBestBrowser(browsers: DetectedBrowser[]): DetectedBrowser | null {
  if (browsers.length === 0) return null;
  return browsers[0];
}

export async function openExtensionsPage(browserId: string): Promise<DeployResult> {
  const info = KNOWN_BROWSERS[browserId];
  if (!info) {
    return { method: 'none', success: false, details: `Unknown browser: ${browserId}` };
  }
  try {
    await shell.openExternal(info.extensionsUrl);
    logger.info(`[deploy] opened extensions page for ${browserId}`);
    return { method: 'store-url', success: true, details: `Opened ${info.extensionsUrl}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { method: 'none', success: false, details: msg };
  }
}

export function getChromiumExtFolder(): string {
  const src = path.join(extensionDir || app.getAppPath(), 'browser-extension', 'chrome-release');
  const dst = path.join(app.getPath('userData'), 'chromium-extension');
  if (!fs.existsSync(src)) {
    throw new Error(`Chrome extension source not found at ${src}`);
  }
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
    copyDirSync(src, dst);
    logger.info(`[deploy] copied chrome-release to ${dst}`);
  }
  return dst;
}

export async function openExtensionFolder(): Promise<DeployResult> {
  try {
    const folder = getChromiumExtFolder();
    await shell.openPath(folder);
    logger.info(`[deploy] opened extension folder at ${folder}`);
    return { method: 'store-url', success: true, details: `Opened ${folder}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { method: 'none', success: false, details: msg };
  }
}

function copyDirSync(src: string, dst: string) {
  for (const entry of fs.readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const dstPath = path.join(dst, entry);
    if (fs.statSync(srcPath).isDirectory()) {
      fs.mkdirSync(dstPath, { recursive: true });
      copyDirSync(srcPath, dstPath);
    } else {
      fs.copyFileSync(srcPath, dstPath);
    }
  }
}

const STORE_URLS: Record<string, string> = {
  chrome: 'https://chromewebstore.google.com/detail/kgklifcallapplgnjipeloiaocgalhco',
  brave: 'https://chromewebstore.google.com/detail/kgklifcallapplgnjipeloiaocgalhco',
  edge: 'https://chromewebstore.google.com/detail/kgklifcallapplgnjipeloiaocgalhco',
  firefox: 'https://addons.mozilla.org/en-US/firefox/addon/forca-focus-mode-blocker/',
};

export function setStoreUrls(urls: Record<string, string>) {
  Object.assign(STORE_URLS, urls);
}

export async function openStoreUrl(browser: string): Promise<DeployResult> {
  const url = STORE_URLS[browser];
  if (!url) {
    return { method: 'none', success: false, details: `No store URL configured for ${browser}` };
  }
  try {
    await shell.openExternal(url);
    logger.info(`[store] opened ${url} for ${browser}`);
    return { method: 'store-url', success: true, details: `Store page opened in your browser` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.warn(`[store] failed to open ${url}: ${msg}`);
    return { method: 'none', success: false, details: msg };
  }
}

export async function deployExtension(browser: string, _browserIsFirefox: boolean): Promise<DeployResult> {
  return openStoreUrl(browser);
}

export function getExtensionIdentity(): { chrome: string; firefox: string; directory: string } {
  return {
    chrome: CHROME_EXTENSION_ID,
    firefox: FIREFOX_EXTENSION_ID,
    directory: extensionDir,
  };
}
