import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, orderBy, limit 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/core/config/firebase.config';
import { ActiveService } from '@/core/types/service.types';
import { ServiceWithProgress, EvidenceUpload } from '../types/execution.types';
import { UserRole } from '@/core/types/global.types';
import * as FileSystem from 'expo-file-system';

const safeToDate = (dateValue: any): Date => {
  if (!dateValue) return new Date(); // valor por defecto si es null/undefined
  
  // Si ya es un Timestamp de Firebase
  if (dateValue?.toDate && typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  // Si es un string o número, crear nuevo Date
  if (typeof dateValue === 'string' || typeof dateValue === 'number') {
    return new Date(dateValue);
  }
  
  // Si ya es un Date
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // Valor por defecto
  console.warn('Formato de fecha no reconocido:', dateValue);
  return new Date();
};

class ExecutionService {
  
  // Obtener servicios del usuario
  async getUserServices(userId: string, role: UserRole): Promise<ServiceWithProgress[]> {
    try {
      let q;

      if (role === 'admin') {
        q = query(
          collection(db, 'activeServices'),
          orderBy('scheduledDate', 'desc')
        );
      } else if (role === 'coordinator') {
        // Primero obtener los proyectos del coordinador
        const userDoc = await getDocs(
          query(collection(db, 'users'), where('uid', '==', userId))
        );
        const userData = userDoc.docs[0]?.data();
        const assignedProjects = userData?.assignedProjects || [];

        q = query(
          collection(db, 'activeServices'),
          where('projectId', 'in', assignedProjects),
          orderBy('scheduledDate', 'desc')
        );
      } else {
        // Ingeniero
        q = query(
          collection(db, 'activeServices'),
          where('assignedTo', 'array-contains', userId),
          orderBy('scheduledDate', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const services: ServiceWithProgress[] = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        
        // ✅ CONVERTIR TIMESTAMPS CORRECTAMENTE
        const scheduledDate = safeToDate(data.scheduledDate);
        const createdAt = safeToDate(data.createdAt);
        const modifiedAt = data.modifiedAt ? safeToDate(data.modifiedAt) : undefined;

        const progress = this.calculateProgress(data);
        
        services.push({
          id: doc.id,
          ...data,
          scheduledDate: data.scheduledDate.toDate(),
          createdAt: data.createdAt.toDate(),
          modifiedAt,
          ...progress,
        } as ServiceWithProgress);
      }

      return services;
    } catch (error) {
      console.error('Error getting user services:', error);
      throw error;
    }
  }

  // Calcular progreso
  private calculateProgress(service: any): { progress: number; totalEvidences: number; completedEvidences: number } {
    let total = 0;
    let completed = 0;

    if (!service.categories) {
      return { progress: 0, totalEvidences: 0, completedEvidences: 0 };
    }

    service.categories.forEach((category: any) => {

      if (!category.instances) return;

      category.instances.forEach((instance: any) => {
        if (instance.subcategories) {
          instance.subcategories.forEach((sub: any) => {
            if (sub.evidences.before.required) total++;
            if (sub.evidences.during.required) total++;
            if (sub.evidences.after.required) total++;
            
            if (sub.evidences.before.completed) completed++;
            if (sub.evidences.during.completed) completed++;
            if (sub.evidences.after.completed) completed++;
          });
        } else if (instance.evidences) {
          if (instance.evidences.before?.required) total++;
          if (instance.evidences.during?.required) total++;
          if (instance.evidences.after?.required) total++;
          
          if (instance.evidences.before?.completed) completed++;
          if (instance.evidences.during?.completed) completed++;
          if (instance.evidences.after?.completed) completed++;
        } else if (instance.signature !== undefined) {
          total++;
          if (instance.signature) completed++;
        }
      });
    });

    return {
      progress: total > 0 ? (completed / total) * 100 : 0,
      totalEvidences: total,
      completedEvidences: completed,
    };
  }

  // Subir evidencia
  async uploadEvidence(
    localUri: string,
    remotePath: string,
    evidenceData: any
  ): Promise<string> {
    try {
      // Leer archivo
      const response = await fetch(localUri);
      const blob = await response.blob();

      // Subir a Storage
      const storageRef = ref(storage, remotePath);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Guardar en Firestore
      const evidenceRef = await addDoc(collection(db, 'evidences'), {
        ...evidenceData,
        imageUrl: downloadURL,
        timestamp: Timestamp.now(),
        synced: true,
      });

      // Actualizar el servicio (marcar como completada)
      await this.updateInstanceEvidence(
        evidenceData.serviceId,
        evidenceData.instanceId,
        evidenceData.subcategoryId,
        evidenceData.stage,
        downloadURL
      );

      return downloadURL;
    } catch (error) {
      console.error('Error uploading evidence:', error);
      throw error;
    }
  }

  // Subir firma
  async uploadSignature(
    localUri: string,
    remotePath: string,
    signatureData: any
  ): Promise<string> {
    try {
      const response = await fetch(localUri);
      const blob = await response.blob();

      const storageRef = ref(storage, remotePath);
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Actualizar instancia con firma
      const serviceRef = doc(db, 'activeServices', signatureData.serviceId);
      // TODO: Actualizar la firma en la instancia específica

      return downloadURL;
    } catch (error) {
      console.error('Error uploading signature:', error);
      throw error;
    }
  }

  // Actualizar evidencia en el servicio
  private async updateInstanceEvidence(
    serviceId: string,
    instanceId: string,
    subcategoryId: string | undefined,
    stage: string,
    imageUrl: string
  ): Promise<void> {
    // Esta función debería actualizar el documento del servicio
    // para marcar esa evidencia como completada
    // Por ahora lo omitimos porque el listener de tiempo real
    // ya actualiza la UI cuando se crea la evidencia
  }

  // Completar servicio
  async completeService(serviceId: string, userId: string, completed: boolean): Promise<void> {
    try {
      const serviceRef = doc(db, 'activeServices', serviceId);
      await updateDoc(serviceRef, {
        status: completed ? 'completed' : 'in_progress',
        modifiedBy: userId,
        modifiedAt: Timestamp.now(),
      });

      // Crear registro de respuesta completa
      if (completed) {
        await addDoc(collection(db, 'serviceResponses'), {
          serviceId,
          engineerId: userId,
          completedAt: Timestamp.now(),
          status: 'complete',
        });
      }
    } catch (error) {
      console.error('Error completing service:', error);
      throw error;
    }
  }
}

export const executionService = new ExecutionService();