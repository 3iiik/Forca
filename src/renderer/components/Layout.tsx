import { memo, ReactNode } from 'react';
import Sidebar from './Sidebar';
import { useAppStore } from '../stores/appStore';

interface LayoutProps {
  children: ReactNode;
}

const Layout = memo(function Layout({ children }: LayoutProps) {
  const { sidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950">
      <Sidebar />
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${
          sidebarOpen ? 'ml-56' : 'ml-14'
        }`}
      >
        <div className="p-6 max-w-6xl mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
});

export default Layout;
