import { ActiveService } from '@/core/types/service.types';
import { Timestamp } from 'firebase/firestore';

export interface ServiceWithProgressUI {
  id: string;
  projectId: string;
  title: string;
  clientName: string;
  location: string;
  scheduledDate: Date;  // 👈 Date para UI
  status: 'pending' | 'in_progress' | 'completed';
  createdBy: string;
  createdAt: Date;      // 👈 Date para UI
  modifiedBy?: string;
  modifiedAt?: Date;    // 👈 Date para UI
  assignedTo: string[];
  categories: any[];
  progress: number;
  totalEvidences: number;
  completedEvidences: number;
}

export interface ServiceWithProgress extends ActiveService {
  progress: number;
  totalEvidences: number;
  completedEvidences: number;
}

// Helpers de conversión
export const serviceToUI = (service: ActiveService & { id: string }): ServiceWithProgressUI => ({
  id: service.id,
  projectId: service.projectId,
  title: service.title,
  clientName: service.clientName,
  location: service.location,
  scheduledDate: service.scheduledDate.toDate(),
  status: service.status,
  createdBy: service.createdBy,
  createdAt: service.createdAt.toDate(),
  modifiedBy: service.modifiedBy,
  modifiedAt: service.modifiedAt?.toDate(),
  assignedTo: service.assignedTo,
  categories: service.categories,
  progress: 0,
  totalEvidences: 0,
  completedEvidences: 0,
});

export interface EvidenceUpload {
  id: string;
  serviceId: string;
  instanceId: string;
  subcategoryId?: string;
  stage: 'before' | 'during' | 'after' | 'signature';
  imageUrl?: string;
  thumbnailUrl?: string;
  comment?: string;
  timestamp: Date;
  synced: boolean;
}

export interface UploadQueueItem {
  id: string;
  localUri: string;
  remotePath: string;
  evidenceData: Omit<EvidenceUpload, 'id' | 'imageUrl' | 'thumbnailUrl' | 'synced'>;
  retries: number;
  timestamp: Date;
}

export interface ExecutionState {
  service: ActiveService | null;
  currentInstance: string | null;
  currentSubcategory: string | null;
  uploads: Record<string, EvidenceUpload>;
  isLoading: boolean;
  error: string | null;
}