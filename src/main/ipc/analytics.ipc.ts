import { ipcMain } from 'electron';
import { trackOnboarding, getOnboardingEvents, getOnboardingFunnel } from '../services/analytics.service';

export function registerAnalyticsIpc() {
  ipcMain.handle('analytics:track', async (_event, event: string, properties?: Record<string, unknown>) => {
    trackOnboarding(event, properties);
    return { success: true };
  });

  ipcMain.handle('analytics:get-events', async () => {
    return getOnboardingEvents();
  });

  ipcMain.handle('analytics:get-funnel', async () => {
    return getOnboardingFunnel();
  });
}
