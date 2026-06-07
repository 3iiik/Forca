/* eslint-disable no-console */

const isDev = process.env.NODE_ENV === 'development' || !!process.env.VITE_DEV_SERVER_URL;

export const logger = {
  info: (...args: unknown[]) => {
    if (isDev) console.log('[Forca]', ...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn('[Forca]', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('[Forca]', ...args);
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug('[Forca]', ...args);
  },
};
