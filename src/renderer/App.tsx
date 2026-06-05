import { useEffect } from 'react';
import { useAppStore } from './stores/appStore';
import Layout from './components/Layout';
import TodayView from './components/TodayView';
import CalendarView from './components/CalendarView';
import BlockRules from './components/BlockRules';
import StatsPage from './components/StatsPage';
import SettingsPage from './components/SettingsPage';
import ZoneProfiles from './components/ZoneProfiles';
import { useAudio } from './hooks/useAudio';
import { ActiveZone, BreakTimer } from './types';

function App() {
  useAudio();
  const {
    currentView, setCurrentView, setActiveZone, setBreakTimer,
    setNotification, setUpdateAvailable, setSettings, darkMode, setDarkMode,
  } = useAppStore();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await window.electronAPI.settings.get();
        setSettings(settings);

        if (settings.general.darkMode === 'dark') {
          setDarkMode(true);
        } else if (settings.general.darkMode === 'light') {
          setDarkMode(false);
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          setDarkMode(prefersDark);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    };
    loadSettings();

    const unsubZone = window.electronAPI.on('zone:updated', (zone: ActiveZone | null) => {
      setActiveZone(zone);
    });

    const unsubBreak = window.electronAPI.on('break:update', (data: BreakTimer) => {
      setBreakTimer(data);
    });

    const unsubNotify = window.electronAPI.on('notification:show', (data: { title: string; body: string }) => {
      setNotification(data);
      setTimeout(() => setNotification(null), 5000);
    });

    const unsubUpdate = window.electronAPI.on('update:available', (data: { version: string }) => {
      setUpdateAvailable(data);
    });

    const unsubTray = window.electronAPI.on('tray:action', (action: string) => {
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
      window.electronAPI.removeAllListeners('zone:updated');
      window.electronAPI.removeAllListeners('break:update');
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const renderView = () => {
    switch (currentView) {
      case 'today':
        return <TodayView />;
      case 'calendar':
        return <CalendarView />;
      case 'block-rules':
        return <BlockRules />;
      case 'stats':
        return <StatsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profiles':
        return <ZoneProfiles />;
      default:
        return <TodayView />;
    }
  };

  return (
    <Layout>
      {renderView()}
    </Layout>
  );
}

export default App;
