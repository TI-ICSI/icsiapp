import { useState, useCallback } from 'react';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { ServiceBuilder, CategoryBuilder } from '@/core/types/service.types';
import { serviceBuilderService } from '../service/service-builder.service';

export const useServiceBuilder = () => {
  const { user } = useAuth();
  const [service, setService] = useState<ServiceBuilder>({
    projectId: '',
    title: '',
    clientName: '',
    location: '',
    scheduledDate: new Date(),
    categories: [],
    createdBy: user?.uid || '',
    createdAt: new Date(),
    assignedTo: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Validar servicio completo
  const validateService = useCallback(() => {
    const errors: string[] = [];

    if (!service.title.trim()) errors.push('El título es requerido');
    if (!service.clientName.trim()) errors.push('El cliente es requerido');
    if (!service.projectId) errors.push('Debe seleccionar un proyecto');
    if (!service.assignedTo || service.assignedTo.length === 0) {
      errors.push('Debe asignar al menos un ingeniero');
    }
    
    service.categories.forEach((category, index) => {
      if (!category.name.trim()) {
        errors.push(`Categoría ${index + 1}: Nombre requerido`);
      }
      if (category.instanceCount < 1) {
        errors.push(`${category.name}: Debe tener al menos 1 instancia`);
      }
      
      if (category.type === 'with_subcategories') {
        if (!category.baseConfig.subcategories?.length) {
          errors.push(`${category.name}: Debe tener al menos una subcategoría`);
        }
      } else if (category.type === 'direct_evidences') {
        const evidences = category.baseConfig.evidences;
        if (!evidences?.before && !evidences?.during && !evidences?.after) {
          errors.push(`${category.name}: Debe configurar al menos una evidencia`);
        }
      }
    });

    setIsValid(errors.length === 0);
    return { isValid: errors.length === 0, errors };
  }, [service]);

  // Actualizar campo del servicio
  const updateServiceField = useCallback((
    field: keyof ServiceBuilder,
    value: any
  ) => {
    setService(prev => ({ ...prev, [field]: value }));
    setTimeout(validateService, 0);
  }, [validateService]);

  // Agregar categoría
  const addCategory = useCallback((type: CategoryBuilder['type']) => {
    const newCategory: CategoryBuilder = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      type,
      instanceCount: 0,
      baseConfig: type === 'with_subcategories' 
        ? { subcategories: [] }
        : type === 'direct_evidences'
        ? { 
            evidences: {
              before: { required: true, enabled: true },
              during: { required: true, enabled: true },
              after: { required: true, enabled: true }
            },
            allowComments: true
          }
        : { requiresSignature: true },
      order: service.categories.length,
      isValid: false,
    };

    setService(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory]
    }));
  }, [service.categories.length]);

  // Actualizar categoría
  const updateCategory = useCallback((
    categoryId: string,
    updates: Partial<CategoryBuilder>
  ) => {
    setService(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      )
    }));
    setTimeout(validateService, 0);
  }, [validateService]);

  // Eliminar categoría
  const removeCategory = useCallback((categoryId: string) => {
    setService(prev => ({
      ...prev,
      categories: prev.categories
        .filter(cat => cat.id !== categoryId)
        .map((cat, index) => ({ ...cat, order: index }))
    }));
    setTimeout(validateService, 0);
  }, [validateService]);

  // Mover categoría (para reordenar)
  const moveCategory = useCallback((fromIndex: number, toIndex: number) => {
    setService(prev => {
      const newCategories = [...prev.categories];
      const [moved] = newCategories.splice(fromIndex, 1);
      newCategories.splice(toIndex, 0, moved);
      
      // Actualizar orden
      const reordered = newCategories.map((cat, index) => ({
        ...cat,
        order: index
      }));
      
      return { ...prev, categories: reordered };
    });
  }, []);

  // Guardar servicio
  const saveService = useCallback(async (serviceData?: ServiceBuilder) => {
    const dataToSave = serviceData || service;
    const validation = validateService();
    
    if (!validation.isValid) {
      throw new Error(validation.errors.join('\n'));
    }

    setIsSaving(true);
    try {
      const serviceId = await serviceBuilderService.createService(dataToSave);
      return serviceId;
    } finally {
      setIsSaving(false);
    }
  }, [service, validateService]);

  return {
    service,
    isSaving,
    isValid,
    updateServiceField,
    addCategory,
    updateCategory,
    removeCategory,
    moveCategory,
    saveService,
    validateService,
  };
};