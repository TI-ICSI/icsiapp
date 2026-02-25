import { CategoryBaseConfig, ServiceInstance } from '@/core/types/service.types';

export const generateInstancesFromConfig = (
  instanceCount: number,
  baseConfig: CategoryBaseConfig,
  categoryType: string,
  categoryName: string
): ServiceInstance[] => {
  const instances: ServiceInstance[] = [];

  for (let i = 1; i <= instanceCount; i++) {
    const instanceId = `inst_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 5)}`;
    
    const instance: ServiceInstance = {
      id: instanceId,
      name: `${categoryName} ${i.toString().padStart(2, '0')}`,
      order: i,
      status: 'pending',
    };

    if (categoryType === 'with_subcategories' && baseConfig.subcategories) {
      // Caso Cajas: copiar subcategorías
      instance.subcategories = baseConfig.subcategories.map(sub => ({
        ...sub,
        id: `${sub.id}_${i}`,
        evidences: {
          before: { ...sub.evidences.before, completed: false },
          during: { ...sub.evidences.during, completed: false },
          after: { ...sub.evidences.after, completed: false },
        }
      }));
    } else if (categoryType === 'direct_evidences' && baseConfig.evidences) {
      // Caso Autocobro: copiar evidencias directas
      instance.evidences = {
        before: { ...baseConfig.evidences.before, completed: false },
        during: { ...baseConfig.evidences.during, completed: false },
        after: { ...baseConfig.evidences.after, completed: false },
      };
      instance.comments = [];
    } else if (categoryType === 'signature') {
      // Caso Firma
      instance.signature = '';
    }

    instances.push(instance);
  }

  return instances;
};