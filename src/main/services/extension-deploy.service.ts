import { shell } from 'electron';
import { logger } from '../utils/logger';

export interface DeployResult {
  method: 'store-url' | 'none';
  success: boolean;
  details: string;
}

const CHROME_EXTENSION_ID = 'kgklifcallapplgnjipeloiaocgalhco';
const FIREFOX_EXTENSION_ID = 'forca-focus@forca.app';

let extensionDir: string;

const STORE_URLS: Record<string, string> = {
  chrome: 'https://chromewebstore.google.com/detail/kgklifcallapplgnjipeloiaocgalhco',
  brave: 'https://chromewebstore.google.com/detail/kgklifcallapplgnjipeloiaocgalhco',
  edge: 'https://chromewebstore.google.com/detail/kgklifcallapplgnjipeloiaocgalhco',
  firefox: 'https://addons.mozilla.org/en-US/firefox/addon/forca-focus-mode-blocker/',
};

export function setExtensionDir(dir: string) {
  extensionDir = dir;
}

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
