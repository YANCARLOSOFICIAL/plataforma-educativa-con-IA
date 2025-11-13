'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  BookOpen,
  Bot,
  User,
  CreditCard,
  LogOut,
  Shield,
  Menu,
  X,
  Sparkles,
  MessageSquare,
  Settings,
  Clock,
  Users,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, clearAuth } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Mis Actividades', href: '/activities', icon: FileText },
    { label: 'Crear Contenido', href: '/create', icon: PlusCircle },
    { label: 'Chatbots IA', href: '/chatbots', icon: Bot, badge: 'Nuevo' },
    { label: 'Comunidad', href: '/community', icon: Users },
    { label: 'Historial', href: '/history', icon: Clock },
  ];

  const bottomItems: NavItem[] = [
    { label: 'Mi Perfil', href: '/profile', icon: User },
    { label: 'Configuración', href: '/settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    bottomItems.unshift({ label: 'Panel Admin', href: '/admin', icon: Shield });
  }

  const handleLogout = async () => {
    clearAuth();
    window.location.href = '/login';
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass-strong shadow-lg"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed left-0 top-0 h-screen glass-strong border-r border-white/20 dark:border-gray-700/50 shadow-2xl z-40 transition-all duration-300 flex flex-col',
          isCollapsed ? 'w-20' : 'w-72',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 dark:border-gray-700/30">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary-500 via-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-purple-400">
                    EduPlatform
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">IA Educativa</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden lg:flex p-2 hover:bg-white/10 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* User Info */}
        {!isCollapsed && user && (
          <div className="p-4 border-b border-white/10 dark:border-gray-700/30">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/30 dark:bg-gray-800/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                {user.full_name?.[0] || user.username[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {user.full_name || user.username}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <CreditCard className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs font-medium text-primary-700 dark:text-primary-300">
                    {user.credits} créditos
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative',
                    active
                      ? 'bg-gradient-to-r from-primary-500 to-blue-600 text-white shadow-lg'
                      : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-5 h-5 transition-transform group-hover:scale-110',
                      active ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    )}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="font-semibold text-sm flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-accent-500 text-white shadow-md">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-white/10 dark:border-gray-700/30" />

          {/* Bottom Navigation */}
          <div className="space-y-1">
            {bottomItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                    active
                      ? 'bg-gradient-to-r from-primary-500 to-blue-600 text-white shadow-lg'
                      : 'hover:bg-white/50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                  )}
                >
                  <Icon
                    className={clsx(
                      'w-5 h-5 transition-transform group-hover:scale-110',
                      active ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    )}
                  />
                  {!isCollapsed && <span className="font-semibold text-sm">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10 dark:border-gray-700/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-all duration-300 group"
          >
            <LogOut className="w-5 h-5 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="font-semibold text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Collapsed indicator */}
      {isCollapsed && (
        <div className="hidden lg:block fixed left-20 top-0 w-1 h-full bg-gradient-to-b from-primary-500 via-blue-600 to-purple-600 opacity-50" />
      )}
    </>
  );
}
