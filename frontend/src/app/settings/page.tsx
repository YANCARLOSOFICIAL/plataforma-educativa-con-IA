'use client';

import { Settings, Moon, Sun, Monitor, User, Mail, Shield, Bell, Palette } from 'lucide-react';
import { Card, Button, Badge } from '@/components/ui';
import DashboardLayout from '@/components/DashboardLayout';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/ThemeProvider';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const user = useAuthStore(state => state.user);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evitar hidratación mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Tema cambiado a ${newTheme === 'dark' ? 'oscuro' : newTheme === 'light' ? 'claro' : 'sistema'}`);
  };

  const roleLabels = {
    admin: 'Administrador',
    docente: 'Docente',
    estudiante: 'Estudiante',
  };

  if (!mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600 dark:text-gray-400">Cargando configuración...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-gray-500 to-gray-700 rounded-2xl shadow-lg">
                    <Settings className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 bg-clip-text text-transparent dark:from-gray-400 dark:via-gray-300 dark:to-gray-400">
                    Configuración
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg ml-16">
                  Personaliza tu experiencia en la plataforma
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Theme Settings */}
          <FadeIn delay={0.15}>
            <Card variant="glass" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <Palette className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Apariencia
                </h2>
              </div>

              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Selecciona el tema de la interfaz
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Light Theme */}
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      theme === 'light'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-4 rounded-xl ${
                        theme === 'light'
                          ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <Sun className={`w-8 h-8 ${
                          theme === 'light' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">Claro</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tema clásico</p>
                      </div>
                      {theme === 'light' && (
                        <Badge variant="primary">Activo</Badge>
                      )}
                    </div>
                  </button>

                  {/* Dark Theme */}
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-4 rounded-xl ${
                        theme === 'dark'
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <Moon className={`w-8 h-8 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">Oscuro</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Reduce fatiga visual</p>
                      </div>
                      {theme === 'dark' && (
                        <Badge variant="primary">Activo</Badge>
                      )}
                    </div>
                  </button>

                  {/* System Theme */}
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`p-6 rounded-2xl border-2 transition-all ${
                      theme === 'system'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className={`p-4 rounded-xl ${
                        theme === 'system'
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}>
                        <Monitor className={`w-8 h-8 ${
                          theme === 'system' ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900 dark:text-white mb-1">Sistema</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Automático</p>
                      </div>
                      {theme === 'system' && (
                        <Badge variant="primary">Activo</Badge>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Account Info */}
          <SlideIn direction="up" delay={0.2}>
            <Card variant="glass" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Información de la Cuenta
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Nombre de Usuario
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {user?.username}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Correo Electrónico
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white break-all">
                    {user?.email}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Rol
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {user ? roleLabels[user.role as keyof typeof roleLabels] || user.role : ''}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                      Estado
                    </p>
                  </div>
                  <Badge variant={user?.is_active ? 'success' : 'danger'}>
                    {user?.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </Card>
          </SlideIn>

          {/* Notifications Settings (Placeholder) */}
          <SlideIn direction="up" delay={0.25}>
            <Card variant="glass" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notificaciones
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Gestiona cómo quieres recibir notificaciones sobre tus actividades
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white mb-1">
                      Notificaciones de Actividades
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recibe notificaciones cuando se complete una actividad
                    </p>
                  </div>
                  <Badge variant="info">Próximamente</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white mb-1">
                      Notificaciones de Créditos
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Avisos cuando tus créditos estén bajos
                    </p>
                  </div>
                  <Badge variant="info">Próximamente</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white mb-1">
                      Actualizaciones del Sistema
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Información sobre nuevas funciones y mejoras
                    </p>
                  </div>
                  <Badge variant="info">Próximamente</Badge>
                </div>
              </div>
            </Card>
          </SlideIn>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
