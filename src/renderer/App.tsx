import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useAppStore } from './stores/appStore';
import Layout from './components/Layout';
import OnboardingFlow from './components/OnboardingFlow';
import { useAudio } from './hooks/useAudio';
import { logger } from './utils/logger';

const TodayView = lazy(() => import('./components/TodayView'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const BlockRules = lazy(() => import('./components/BlockRules'));
const StatsPage = lazy(() => import('./components/StatsPage'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const ZoneProfiles = lazy(() => import('./components/ZoneProfiles'));

function App() {
  useAudio();
  const {
    currentView, setCurrentView, setActiveZone, setBreakTimer,
    setNotification, setUpdateAvailable, setSettings, setZones, setProfiles,
    darkMode, setDarkMode, onboardingComplete, setOnboardingComplete,
  } = useAppStore();
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const notifyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await window.electronAPI.app.getOnboardingStatus();
        setOnboardingComplete(completed);
      } catch {
        setOnboardingComplete(true);
      }
      setOnboardingLoading(false);
    };
    checkOnboarding();
  }, [setOnboardingComplete]);

  useEffect(() => {
    const api = window.electronAPI;
    if (!api) {
      logger.warn('Forca is running outside Electron — electronAPI not available');
      return;
    }

    const loadSettings = async () => {
      try {
        const settings = await api.settings.get();
        setSettings(settings);

        if (settings.general.darkMode === 'dark') {
          setDarkMode(true);
        } else if (settings.general.darkMode === 'light') {
          setDarkMode(false);
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setDarkMode(prefersDark);
        }
        const [zones, profiles] = await Promise.all([
          api.zone.list(),
          api.profiles.list(),
        ]);
        setZones(zones);
        setProfiles(profiles);
      } catch (err) {
        logger.error('Failed to load settings:', err);
      }
    };
    loadSettings();

    const unsubZone = api.on('zone:updated', (zone: import('./types').ActiveZone) => {
      setActiveZone(zone);
    });

    const unsubBreak = api.on('break:update', (data: { isBreak: boolean; remaining: number; total: number }) => {
      setBreakTimer(data);
    });

    const unsubNotify = api.on('notification:show', (data: { title: string; body: string }) => {
      setNotification(data);
      if (notifyTimeoutRef.current) clearTimeout(notifyTimeoutRef.current);
      notifyTimeoutRef.current = setTimeout(() => setNotification(null), 5000);
    });

    const unsubUpdate = api.on('update:available', (data: { version: string }) => {
      setUpdateAvailable(data);
    });

    const unsubTray = api.on('tray:action', (action: string) => {
      switch (action) {
        case 'start-focus':
          setCurrentView('today');
          break;
        case 'show-schedule':
          setCurrentView('calendar');
          break;
        case 'open-settings':
          setCurrentView('settings');
          break;
      }
    });

    return () => {
      unsubZone();
      unsubBreak();
      unsubNotify();
      unsubUpdate();
      unsubTray();
      if (notifyTimeoutRef.current) clearTimeout(notifyTimeoutRef.current);
      api.removeAllListeners('zone:updated');
      api.removeAllListeners('break:update');
    };
  }, [setActiveZone, setBreakTimer, setCurrentView, setDarkMode, setNotification, setProfiles, setSettings, setUpdateAvailable, setZones]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  if (onboardingLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!onboardingComplete) {
    return <OnboardingFlow />;
  }

  return (
    <Layout>
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>}>
        {currentView === 'today' && <TodayView />}
        {currentView === 'calendar' && <CalendarView />}
        {currentView === 'block-rules' && <BlockRules />}
        {currentView === 'stats' && <StatsPage />}
        {currentView === 'settings' && <SettingsPage />}
        {currentView === 'profiles' && <ZoneProfiles />}
      </Suspense>
    </Layout>
  );
}

export default App;
