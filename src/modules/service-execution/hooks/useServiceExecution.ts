import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/core/config/firebase.config';
import { ActiveService } from '@/core/types/service.types';
import { executionService } from '../services/execution.service';
import { useOfflineQueue } from './useOfflineQueue';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { compressImage } from '@/core/utils/image.utils';

export const useServiceExecution = (serviceId: string) => {
  const { user } = useAuth();
  const [service, setService] = useState<ActiveService | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ completed: number; total: number; percentage: number }>({
  completed: 0,
  total: 0,
  percentage: 0
});
  
  const { addToQueue, isOnline } = useOfflineQueue();

  // Calcular progreso
  const calculateProgress = useCallback((service: ActiveService) => {
  let total = 0;
  let completed = 0;

  service.categories.forEach(category => {
    category.instances.forEach(instance => {
      const inst = instance as any; // 👈 Convertir a any para evitar errores
      
      if (inst.subcategories) {
        // Caso Cajas
        inst.subcategories.forEach((sub: any) => {
          if (sub.evidences.before.required) total++;
          if (sub.evidences.during.required) total++;
          if (sub.evidences.after.required) total++;
          
          if (sub.evidences.before.completed) completed++;
          if (sub.evidences.during.completed) completed++;
          if (sub.evidences.after.completed) completed++;
        });
      } else if (inst.evidences) {
        // Caso Autocobro
        if (inst.evidences.before?.required) total++;
        if (inst.evidences.during?.required) total++;
        if (inst.evidences.after?.required) total++;
        
        if (inst.evidences.before?.completed) completed++;
        if (inst.evidences.during?.completed) completed++;
        if (inst.evidences.after?.completed) completed++;
      } else if (inst.signature !== undefined) {
        // Caso Firma
        total++;
        if (inst.signature) completed++;
      }
    });
  });

  return { total, completed, percentage: total > 0 ? (completed / total) * 100 : 0 };
}, []);

  // Escuchar cambios en tiempo real
  useEffect(() => {
    if (!serviceId) return;

    const unsubscribe = onSnapshot(
      doc(db, 'activeServices', serviceId),
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const serviceData = { id: docSnapshot.id, ...docSnapshot.data() } as ActiveService;
          setService(serviceData);
          const newProgress = calculateProgress(serviceData);
          setProgress(newProgress);
        } else {
          setError('Servicio no encontrado');
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Error listening to service:', err);
        setError('Error al cargar el servicio');
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [serviceId]);

  // Subir foto
  const uploadPhoto = useCallback(async (
    instanceId: string,
    subcategoryId: string | undefined,
    stage: 'before' | 'during' | 'after',
    localUri: string,
    comment?: string
  ) => {
    if (!service || !user) return;

    try {
      // 1. Comprimir imagen
      const compressedUri = await compressImage(localUri);
      
      // 2. Generar ruta en Storage
      const timestamp = Date.now();
      const path = `evidences/${serviceId}/${user.uid}/${instanceId}/${stage}_${timestamp}.jpg`;

      // 3. Preparar datos de evidencia
      const evidenceData = {
        serviceId,
        engineerId: user.uid,
        instanceId,
        subcategoryId,
        stage,
        comment,
        timestamp: new Date(),
      };

      if (isOnline) {
        // Subir directamente
        await executionService.uploadEvidence(compressedUri, path, evidenceData);
      } else {
        // Agregar a cola offline
        await addToQueue({
          localUri: compressedUri,
          remotePath: path,
          evidenceData,
        });
        Alert.alert('Offline', 'La foto se subirá cuando tengas conexión');
      }

      // 4. Actualizar UI optimista
      setService(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        // Actualizar la instancia correspondiente
        updated.categories.forEach(category => {
          category.instances.forEach(instance => {
            if (instance.id === instanceId) {
              if (subcategoryId && instance.subcategories) {
                const sub = instance.subcategories.find(s => s.id === subcategoryId);
                if (sub) {
                  (sub.evidences[stage] as any).completed = true;
                }
              } else if (instance.evidences) {
                if (instance.evidences){
                  (instance.evidences[stage]as any).completed = true;
                }
              }
            }
          });
        });
        return updated;
      });

    } catch (error) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', 'No se pudo subir la foto');
    }
  }, [service, user, serviceId, isOnline, addToQueue]);

  // Guardar firma
  const saveSignature = useCallback(async (instanceId: string, signatureUri: string) => {
    if (!service || !user) return;

    try {
      const path = `signatures/${serviceId}/${instanceId}/signature.png`;
      const timestamp = Date.now();

      if (isOnline) {
        await executionService.uploadSignature(signatureUri, path, {
          serviceId,
          instanceId,
          timestamp: new Date(),
        });
      } else {
        await addToQueue({
          localUri: signatureUri,
          remotePath: path,
          evidenceData: {
            serviceId,
            instanceId,
            stage: 'signature',
            timestamp: new Date(),
          },
        });
      }

      // Actualizar UI
      setService(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.categories.forEach(category => {
          category.instances.forEach(instance => {
            if (instance.id === instanceId) {
              instance.signature = 'pending';
            }
          });
        });
        return updated;
      });

    } catch (error) {
      console.error('Error saving signature:', error);
      Alert.alert('Error', 'No se pudo guardar la firma');
    }
  }, [service, user, serviceId, isOnline, addToQueue]);

  // Finalizar servicio
  const completeService = useCallback(async () => {
    if (!service || !user) return;

    const { total, completed } = progress;
    
    if (completed < total) {
      Alert.alert(
        'Servicio Incompleto',
        `Faltan ${total - completed} evidencias por subir. ¿Deseas finalizar de todos modos?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Finalizar', 
            style: 'destructive',
            onPress: async () => {
              await executionService.completeService(serviceId, user.uid, false);
            }
          }
        ]
      );
    } else {
      await executionService.completeService(serviceId, user.uid, true);
      Alert.alert('✅ Éxito', 'Servicio completado correctamente');
    }
  }, [service, user, serviceId, progress]);

  return {
    service,
    isLoading,
    error,
    progress,
    uploadPhoto,
    saveSignature,
    completeService,
    isOnline,
  };
};