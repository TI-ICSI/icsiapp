import { Timestamp } from 'firebase/firestore';

// Tipos de categoría
export type CategoryType = 'with_subcategories' | 'direct_evidences' | 'signature';

// Configuración de evidencia
export interface EvidenceConfig {
  required: boolean;
  enabled: boolean;
  completed?: boolean;
  imageUrl?: string;
}

// Subcategoría (para Cajas, etc)
export interface Subcategory {
  id: string;
  name: string;
  evidences: {
    before: EvidenceConfig;
    during: EvidenceConfig;
    after: EvidenceConfig;
  };
  allowComments: boolean;
  order: number;
}

// Configuración base de categoría
export interface CategoryBaseConfig {
  // Para categorías con subcategorías (Cajas)
  subcategories?: Subcategory[];
  // Para categorías sin subcategorías (Autocobro)
  evidences?: {
    before: EvidenceConfig;
    during: EvidenceConfig;
    after: EvidenceConfig;
  };
  allowComments?: boolean;
  requiresSignature?: boolean;
}

// Categoría en construcción
export interface CategoryBuilder {
  id: string;
  name: string;
  type: CategoryType;
  instanceCount: number;  // ✅ El coordinador define manualmente
  baseConfig: CategoryBaseConfig;
  order: number;
  isValid: boolean;
}

// Servicio en construcción
export interface ServiceBuilder {
  projectId: string;
  title: string;
  clientName: string;
  location: string;
  scheduledDate: Date;
  categories: CategoryBuilder[];
  createdBy: string;
  createdAt: Date;
  assignedTo: string[];
}

// Instancia generada (Caja 01, Autocobro 01, etc)
export interface ServiceInstance {
  id: string;
  name: string;
  order: number;
  status: 'pending' | 'in_progress' | 'completed';
  subcategories?: Subcategory[];
  evidences?: {
    before: EvidenceConfig;
    during: EvidenceConfig;
    after: EvidenceConfig;
  };
  signature?: string;
  comments?: Comment[];
}

// Servicio publicado (en Firestore)
export interface ActiveService {
  id: string;
  projectId: string;
  title: string;
  clientName: string;
  location: string;
  scheduledDate: Timestamp;
  status: 'pending' | 'in_progress' | 'completed';
  createdBy: string;
  createdAt: Timestamp;
  modifiedBy?: string;
  modifiedAt?: Timestamp;
  assignedTo: string[];
  categories: {
    id: string;
    name: string;
    type: CategoryType;
    instanceCount: number;
    instances: ServiceInstance[];
  }[];
}