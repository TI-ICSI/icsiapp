import { useState, useCallback } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { userService } from '../services/user.service';
import { CreateUserFormData, CreateUserResult } from '../types/user.types';
import { ALLOWED_ROLES_TO_CREATE } from '@/core/constants/roles.constants';
import { Alert } from 'react-native';

export const useCreateUser = () => {
  const { user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar qué roles puede crear el usuario actual
  const getAllowedRoles = useCallback(() => {
    if (!currentUser) return [];
    return ALLOWED_ROLES_TO_CREATE[currentUser.role] || [];
  }, [currentUser]);

  // Verificar si puede crear un rol específico
  const canCreateRole = useCallback((role: string) => {
    if (!currentUser) return false;
    return ALLOWED_ROLES_TO_CREATE[currentUser.role]?.includes(role as any) || false;
  }, [currentUser]);

  // Crear usuario
  const createUser = useCallback(async (data: CreateUserFormData): Promise<CreateUserResult> => {
    if (!currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión');
      return { success: false, error: 'No autenticado' };
    }

    // Verificar permiso para crear este rol
    if (!canCreateRole(data.role)) {
      Alert.alert('Error', 'No tienes permiso para crear usuarios con este rol');
      return { success: false, error: 'Permiso denegado' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await userService.createUser(data, currentUser.uid);
      
      if (result.success) {
        Alert.alert(
          '✅ Usuario Creado',
          `El usuario ${data.name} ${data.lastName} ha sido registrado exitosamente.`
        );
      } else {
        setError(result.error || 'Error al crear usuario');
        Alert.alert('Error', result.error || 'No se pudo crear el usuario');
      }
      
      return result;
    } catch (err: any) {
      const errorMsg = err.message || 'Error inesperado';
      setError(errorMsg);
      Alert.alert('Error', errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, canCreateRole]);

  return {
    isLoading,
    error,
    createUser,
    getAllowedRoles,
    canCreateRole,
  };
};