import { useCallback } from 'react';
import { CategoryBuilder, Subcategory } from '@/core/types/service.types';

interface EvidenceConfig {
  required: boolean;
  enabled: boolean;
}

interface EvidencesConfig {
  before: EvidenceConfig;
  during: EvidenceConfig;
  after: EvidenceConfig;
}

export const useCategoryManagement = (
  category: CategoryBuilder,
  onUpdate: (updates: Partial<CategoryBuilder>) => void
) => {
  // Actualizar nombre
  const updateName = useCallback((name: string) => {
    onUpdate({ name });
  }, [onUpdate]);

  // Actualizar cantidad de instancias
  const updateInstanceCount = useCallback((count: number) => {
    onUpdate({ instanceCount: count });
  }, [onUpdate]);

  // Para categorías con subcategorías (Cajas)
  const addSubcategory = useCallback(() => {
    if (category.type !== 'with_subcategories') return;

    const newSubcategory: Subcategory = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: '',
      evidences: {
        before: { required: true, enabled: true },
        during: { required: false, enabled: true },
        after: { required: true, enabled: true }
      },
      allowComments: true,
      order: category.baseConfig.subcategories?.length || 0,
    };

    onUpdate({
      baseConfig: {
        ...category.baseConfig,
        subcategories: [...(category.baseConfig.subcategories || []), newSubcategory]
      }
    });
  }, [category, onUpdate]);

  // Eliminar subcategoría
  const removeSubcategory = useCallback((subcategoryId: string) => {
    if (category.type !== 'with_subcategories') return;

    onUpdate({
      baseConfig: {
        ...category.baseConfig,
        subcategories: category.baseConfig.subcategories?.filter(
          sub => sub.id !== subcategoryId
        )
      }
    });
  }, [category, onUpdate]);

  // Actualizar subcategoría
  const updateSubcategory = useCallback((
    subcategoryId: string,
    updates: Partial<Subcategory>
  ) => {
    if (category.type !== 'with_subcategories') return;

    onUpdate({
      baseConfig: {
        ...category.baseConfig,
        subcategories: category.baseConfig.subcategories?.map(sub =>
          sub.id === subcategoryId ? { ...sub, ...updates } : sub
        )
      }
    });
  }, [category, onUpdate]);

  // Para categorías con evidencias directas (Autocobro)
  const toggleEvidence = useCallback((
    evidenceType: 'before' | 'during' | 'after',
    field: 'required' | 'enabled'
  ) => {
    if (category.type !== 'direct_evidences') return;

    const defaultEvidence = { required: false, enabled: false };
    const currentEvidences = category.baseConfig.evidences;
    
    // Valores por defecto para cada tipo de evidencia
    const safeEvidences: EvidencesConfig = {
      before: currentEvidences?.before || defaultEvidence,
      during: currentEvidences?.during || defaultEvidence,
      after: currentEvidences?.after || defaultEvidence,
    };

    onUpdate({
      baseConfig: {
        ...category.baseConfig,
        evidences: {
          ...safeEvidences,
          [evidenceType]: {
            ...safeEvidences[evidenceType],
            [field]: !safeEvidences[evidenceType][field]
          }
        }
      }
    });
  }, [category, onUpdate]);

  // Alternar comentarios
  const toggleComments = useCallback(() => {
    onUpdate({
      baseConfig: {
        ...category.baseConfig,
        allowComments: !category.baseConfig.allowComments
      }
    });
  }, [category, onUpdate]);

  return {
    updateName,
    updateInstanceCount,
    addSubcategory,
    removeSubcategory,
    updateSubcategory,
    toggleEvidence,
    toggleComments,
  };
};