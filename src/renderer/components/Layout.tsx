import { memo, ReactNode, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { useAppStore } from '../stores/appStore';

interface LayoutProps {
  children: ReactNode;
}

const Layout = memo(function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useAppStore();
  const [extensionConnected, setExtensionConnected] = useState(false);

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const count = await window.electronAPI.extension.getClientCount();
        setExtensionConnected(count > 0);
      } catch {
        setExtensionConnected(false);
      }
    }, 3000);

    return () => clearInterval(poll);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'ml-56' : 'ml-14'
        }`}
      >
        <div className="sticky top-0 z-20 flex items-center justify-end px-5 py-2 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${extensionConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-[11px] text-zinc-500 leading-none">
              {extensionConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
        <div className="p-6 max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
});

export default Layout;
