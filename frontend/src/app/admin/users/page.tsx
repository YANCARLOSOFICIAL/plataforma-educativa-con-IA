'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { Card, Button, Input, Badge } from '@/components/ui';
import Spinner from '@/components/ui/Spinner';
import PageTransition, { FadeIn } from '@/components/PageTransition';
import { Search, Edit, Trash2, Plus, Minus, X } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import type { UserListItem, UserUpdate, CreditAdjustment, UserRole } from '@/types';

export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [adjustingCredits, setAdjustingCredits] = useState<UserListItem | null>(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditDescription, setCreditDescription] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users', searchQuery],
    queryFn: () => adminAPI.getUsers({ search: searchQuery || undefined }),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserUpdate }) =>
      adminAPI.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuario actualizado correctamente');
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al actualizar usuario');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => adminAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Usuario eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al eliminar usuario');
    },
  });

  const adjustCreditsMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: CreditAdjustment }) =>
      adminAPI.adjustCredits(userId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(`Créditos ajustados. Nuevo balance: ${data.new_balance}`);
      setAdjustingCredits(null);
      setCreditAmount(0);
      setCreditDescription('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al ajustar créditos');
    },
  });

  const handleDeleteUser = (user: UserListItem) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${user.email}?`)) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const handleUpdateUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    const formData = new FormData(e.currentTarget);
    const data: UserUpdate = {
      email: formData.get('email') as string,
      full_name: formData.get('full_name') as string,
      role: formData.get('role') as UserRole,
      is_active: formData.get('is_active') === 'true',
      credits: parseInt(formData.get('credits') as string, 10),
    };

    updateUserMutation.mutate({ userId: editingUser.id, data });
  };

  const handleAdjustCredits = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!adjustingCredits) return;

    adjustCreditsMutation.mutate({
      userId: adjustingCredits.id,
      data: {
        amount: creditAmount,
        description: creditDescription,
      },
    });
  };

  const getRoleBadgeVariant = (role: string): 'danger' | 'primary' | 'info' => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'docente':
        return 'primary';
      default:
        return 'info';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Usuarios</h1>
              <p className="text-gray-600 dark:text-gray-400">Administra todos los usuarios de la plataforma</p>
            </div>
            <Badge variant="primary" size="lg">
              {users?.length || 0} usuarios
            </Badge>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card padding="md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por email, nombre de usuario o nombre completo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Créditos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users?.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        #{user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {user.full_name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setAdjustingCredits(user)}
                          className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          {user.credits}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={user.is_active ? 'success' : 'default'}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteUser(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">No se encontraron usuarios</p>
                </div>
              )}
            </div>
          </Card>
        </FadeIn>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/80 z-50 flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Editar Usuario</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <Input
                name="email"
                label="Email"
                type="email"
                defaultValue={editingUser.email}
                required
                fullWidth
              />

              <Input
                name="full_name"
                label="Nombre Completo"
                type="text"
                defaultValue={editingUser.full_name || ''}
                fullWidth
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Rol <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  defaultValue={editingUser.role}
                  required
                  className={clsx(
                    'px-4 py-2 border rounded-lg transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'dark:bg-gray-700 dark:text-white dark:border-gray-600',
                    'border-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                  )}
                >
                  <option value="admin">Admin</option>
                  <option value="docente">Docente</option>
                  <option value="estudiante">Estudiante</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  name="is_active"
                  defaultValue={editingUser.is_active ? 'true' : 'false'}
                  required
                  className={clsx(
                    'px-4 py-2 border rounded-lg transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    'dark:bg-gray-700 dark:text-white dark:border-gray-600',
                    'border-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                  )}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>

              <Input
                name="credits"
                label="Créditos"
                type="number"
                defaultValue={editingUser.credits}
                required
                fullWidth
              />

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={updateUserMutation.isPending}
                >
                  Guardar Cambios
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setEditingUser(null)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Adjust Credits Modal */}
      {adjustingCredits && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-gray-950/80 z-50 flex items-center justify-center p-4">
          <Card padding="lg" className="max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ajustar Créditos</h2>
              <button
                onClick={() => {
                  setAdjustingCredits(null);
                  setCreditAmount(0);
                  setCreditDescription('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Usuario</p>
              <p className="font-semibold text-gray-900 dark:text-white">{adjustingCredits.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Créditos actuales</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{adjustingCredits.credits}</p>
            </div>

            <form onSubmit={handleAdjustCredits} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                  Cantidad a ajustar
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreditAmount(creditAmount - 10)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(parseInt(e.target.value, 10) || 0)}
                    placeholder="0"
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreditAmount(creditAmount + 10)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Usa números negativos para restar créditos
                </p>
              </div>

              <Input
                label="Descripción"
                type="text"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder="Ej: Ajuste manual de créditos"
                required
                fullWidth
              />

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Nuevo balance: {' '}
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {adjustingCredits.credits + creditAmount}
                  </span>
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={adjustCreditsMutation.isPending}
                >
                  Confirmar Ajuste
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    setAdjustingCredits(null);
                    setCreditAmount(0);
                    setCreditDescription('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </PageTransition>
  );
}
