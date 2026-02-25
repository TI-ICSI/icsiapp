import { CategoryBuilder } from '@/core/types/service.types';

export interface BuilderState {
  currentStep: number;
  isValid: boolean;
  errors: Record<string, string>;
}

export interface BuilderActions {
  addCategory: (type: CategoryBuilder['type']) => void;
  removeCategory: (categoryId: string) => void;
  updateCategory: (categoryId: string, updates: Partial<CategoryBuilder>) => void;
  moveCategory: (fromIndex: number, toIndex: number) => void;
}

export interface InstanceGenerationResult {
  success: boolean;
  instances: any[];
  errors?: string[];
}