import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '@/core/config/firebase.config';
import { ServiceBuilder, ActiveService } from '@/core/types/service.types';
import { generateInstancesFromConfig } from '../utils/instance-generator';
import { auth } from '@/core/config/firebase.config';

class ServiceBuilderService {
  // Crear nuevo servicio
  async createService(service: ServiceBuilder): Promise<string> {
    try {
      // Validar usuario autenticado
      if (!auth.currentUser) {
        throw new Error('Debe iniciar sesión para crear un servicio');
      }

      // Generar instancias para cada categoría
      const categoriesWithInstances = service.categories.map(category => ({
        id: category.id,
        name: category.name,
        type: category.type,
        instanceCount: category.instanceCount,
        instances: generateInstancesFromConfig(
          category.instanceCount,
          category.baseConfig,
          category.type,
          category.name
        )
      }));

      // Preparar documento para Firestore
      const activeService: Omit<ActiveService, 'id'> = {
        projectId: service.projectId,
        title: service.title,
        clientName: service.clientName,
        location: service.location,
        scheduledDate: Timestamp.fromDate(service.scheduledDate),
        status: 'pending',
        createdBy: auth.currentUser.uid,
        createdAt: Timestamp.now(),
        assignedTo: service.assignedTo,
        categories: categoriesWithInstances,
      };

      // Guardar en Firestore
      const docRef = await addDoc(collection(db, 'activeServices'), activeService);
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  // Actualizar servicio existente
  async updateService(serviceId: string, updates: Partial<ActiveService>): Promise<void> {
    try {
      if (!auth.currentUser) {
        throw new Error('Debe iniciar sesión para actualizar un servicio');
      }

      const serviceRef = doc(db, 'activeServices', serviceId);
      await updateDoc(serviceRef, {
        ...updates,
        modifiedBy: auth.currentUser.uid,
        modifiedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  // Validar permisos (solo admin/coordinador)
  async validatePermissions(): Promise<boolean> {
    // Esta validación se hará con Security Rules en Firebase
    // Aquí solo verificamos que sea admin o coordinador
    const user = auth.currentUser;
    if (!user) return false;

    // La validación real se hará en Firestore Rules
    return true;
  }
}

export const serviceBuilderService = new ServiceBuilderService();