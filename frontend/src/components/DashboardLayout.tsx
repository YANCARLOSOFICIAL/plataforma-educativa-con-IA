'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Sidebar from './Sidebar';
import ThemeToggle from './ThemeToggle';
import { Bell, Search } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen mesh-bg flex">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/30 shadow-glass">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
              {/* Search Bar - Hidden on small mobile, visible on sm+ */}
              <div className="hidden sm:flex flex-1 max-w-2xl">
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar actividades, chatbots..."
                    className="w-full pl-12 pr-4 py-2.5 sm:py-3 rounded-xl glass-strong border-0 focus:ring-2 focus:ring-primary-500 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Mobile Search Icon */}
              <button className="sm:hidden p-2 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all">
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* Right Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button className="relative p-2 sm:p-3 hover:bg-white/50 dark:hover:bg-gray-700/50 rounded-xl transition-all group">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
                  <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-2 h-2 bg-red-500 rounded-full" />
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
