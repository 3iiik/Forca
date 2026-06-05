import { useAppStore } from '../stores/appStore';

const navItems = [
  { id: 'today', label: 'Today', icon: '◉' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'block-rules', label: 'Block Rules', icon: '🚫' },
  { id: 'profiles', label: 'Profiles', icon: '👤' },
  { id: 'stats', label: 'Stats', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, activeZone } = useAppStore();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col z-30 transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-500" />
            <span className="font-bold text-base">Forca</span>
          
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-ghost p-1 rounded-lg"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="text-lg">{sidebarOpen ? '◀' : '▶'}</span>
        </button>
      </div>

      {/* Active zone indicator */}
      {activeZone && sidebarOpen && (
        <div className="mx-3 mt-3 p-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-focus-green animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-300 truncate">
              {activeZone.zoneName}
            </span>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            {Math.floor(activeZone.remaining / 60)}m {activeZone.remaining % 60}s remaining
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`sidebar-item w-full ${currentView === item.id ? 'active' : ''}`}
            title={!sidebarOpen ? item.label : undefined}
          >
            <span className="text-lg w-6 text-center flex-shrink-0">{item.icon}</span>
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        {sidebarOpen && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
              FZ
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                Forca v1.0
              
              </div>
              <div className="text-xs text-gray-400">Ready to focus</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
