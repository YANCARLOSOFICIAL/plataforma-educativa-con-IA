'use client';

import { Settings, Moon, Sun, Monitor, User, Mail, Shield, Bell, Palette, Lock, Eye, EyeOff } from 'lucide-react';
import { Card, Button, Badge, Input } from '@/components/ui';
import DashboardLayout from '@/components/DashboardLayout';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';
import { useAuthStore } from '@/lib/store';
import { useTheme } from '@/components/ThemeProvider';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';

export default function SettingsPage() {
  const user = useAuthStore(state => state.user);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Estados para cambio de contraseña
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Evitar hidratación mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Tema cambiado a ${newTheme === 'dark' ? 'oscuro' : newTheme === 'light' ? 'claro' : 'sistema'}`);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsChangingPassword(true);
    const toastId = toast.loading('Cambiando contraseña...');

    try {
      await authAPI.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      toast.success('Contraseña cambiada exitosamente', { id: toastId });

      // Limpiar formulario
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      toast.error(
        error?.response?.data?.detail || 'Error al cambiar la contraseña. Verifica tu contraseña actual.',
        { id: toastId }
      );
    } finally {
      setIsChangingPassword(false);
    }
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

          {/* Security Settings */}
          <SlideIn direction="up" delay={0.25}>
            <Card variant="glass" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl shadow-lg">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Seguridad
                </h2>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Gestiona la seguridad de tu cuenta
              </p>

              {!showPasswordForm ? (
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white mb-1">
                      Cambiar Contraseña
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Actualiza tu contraseña para mantener tu cuenta segura
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Cambiar
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                      Contraseña Actual
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Ingresa tu contraseña actual"
                        required
                        fullWidth
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                        required
                        fullWidth
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                      Confirmar Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                        required
                        fullWidth
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      isLoading={isChangingPassword}
                    >
                      Guardar Nueva Contraseña
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        setShowPasswordForm(false);
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </SlideIn>

          {/* Notifications Settings (Placeholder) */}
          <SlideIn direction="up" delay={0.3}>
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
