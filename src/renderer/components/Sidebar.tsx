import { memo, useEffect, useState } from 'react';
import { useAppStore } from '../stores/appStore';
import { LayoutDashboard, Calendar, ShieldOff, User, BarChart3, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const navItems = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'block-rules', label: 'Block Rules', icon: ShieldOff },
  { id: 'profiles', label: 'Profiles', icon: User },
  { id: 'stats', label: 'Stats', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar = memo(function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, activeZone } = useAppStore();
  const [appVersion, setAppVersion] = useState('');
  const [extConnected, setExtConnected] = useState(false);
  const [extCount, setExtCount] = useState(0);

  useEffect(() => {
    window.electronAPI.app.getVersion().then(setAppVersion).catch(() => {});
  }, []);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const count = await window.electronAPI.extension.getClientCount();
        setExtCount(count);
        setExtConnected(count > 0);
      } catch {
        setExtConnected(false);
        setExtCount(0);
      }
    }, 3000);
    return () => clearInterval(poll);
  }, []);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col z-30 transition-all duration-300 ${
        sidebarOpen ? 'w-56' : 'w-14'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-12 border-b border-zinc-800">
        {sidebarOpen && (
          <div className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" className="w-9 h-9 shrink-0">
              <circle cx="48" cy="48" r="26" fill="none" stroke="#44403C" strokeWidth="3.5"/>
              <circle cx="48" cy="48" r="26" fill="none" stroke="#1D9E75" strokeWidth="3.5" strokeDasharray="81 163" strokeDashoffset="41" strokeLinecap="round"/>
              <circle cx="48" cy="48" r="7" fill="#1D9E75"/>
              <rect x="46.5" y="18" width="3" height="11" rx="1.5" fill="#78716C"/>
              <rect x="46.5" y="67" width="3" height="11" rx="1.5" fill="#78716C"/>
              <rect x="18" y="46.5" width="11" height="3" rx="1.5" fill="#78716C"/>
              <rect x="67" y="46.5" width="11" height="3" rx="1.5" fill="#78716C"/>
            </svg>
            <span className="font-semibold text-sm text-zinc-100">Forca</span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 text-zinc-400 hover:text-zinc-300 transition-colors"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Active zone indicator */}
      {activeZone && sidebarOpen && (
        <div className="mx-2 mt-2 px-2 py-1.5 border border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-focus-green animate-pulse" />
            <span className="text-xs font-medium text-zinc-300 truncate">
              {activeZone.zoneName}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 mt-0.5">
            {Math.floor(activeZone.remaining / 60)}m {activeZone.remaining % 60}s
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-2 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`sidebar-item w-full ${currentView === item.id ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {sidebarOpen && <span className="text-xs">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer: extension status + version */}
      {sidebarOpen && (
        <div className="border-t border-zinc-800 px-3 py-2 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${extConnected ? 'bg-focus-green' : 'bg-zinc-600'}`} />
            <span className="text-[11px] text-zinc-500 leading-none">
              {extConnected ? `${extCount} browser${extCount !== 1 ? 's' : ''} connected` : 'Extension disconnected'}
            </span>
          </div>
          {appVersion && (
            <div className="text-[10px] text-zinc-600 leading-none pl-[10px]">
              v{appVersion}
            </div>
          )}
        </div>
      )}

    </aside>
  );
});

export default Sidebar;
