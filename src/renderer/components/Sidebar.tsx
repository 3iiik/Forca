import { memo } from 'react';
import { useAppStore } from '../stores/appStore';

const navItems = [
  { id: 'today', label: 'Today', icon: '◉' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'block-rules', label: 'Block Rules', icon: '🚫' },
  { id: 'profiles', label: 'Profiles', icon: '👤' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

const Sidebar = memo(function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, activeZone } = useAppStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col z-30 transition-all duration-300 ${
        sidebarOpen ? 'w-56' : 'w-14'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-12 border-b border-zinc-800">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <img src="./forca-icon.png" alt="Forca" className="w-6 h-6" />
            <span className="font-semibold text-sm text-zinc-100">Forca</span>
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 text-zinc-400 hover:text-zinc-300 transition-colors"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="text-sm">{sidebarOpen ? '◀' : '▶'}</span>
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
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`sidebar-item w-full ${currentView === item.id ? 'active' : ''}`}
            title={!sidebarOpen ? item.label : undefined}
          >
            <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
            {sidebarOpen && <span className="text-xs">{item.label}</span>}
          </button>
        ))}
      </nav>

    </aside>
  );
});

export default Sidebar;
