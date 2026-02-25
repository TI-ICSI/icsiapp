import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/core/config/firebase.config';
import { EvidenceUpload } from '../types/execution.types';

export const useRealtimePhotos = (serviceId: string, instanceId?: string) => {
  const [photos, setPhotos] = useState<Record<string, EvidenceUpload>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!serviceId) return;

    const constraints = [where('serviceId', '==', serviceId)];
    if (instanceId) {
      constraints.push(where('instanceId', '==', instanceId));
    }

    const q = query(
      collection(db, 'evidences'),
      ...constraints,
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoMap: Record<string, EvidenceUpload> = {};
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        photoMap[doc.id] = {
          id: doc.id,
          ...data,
          timestamp: data.timestamp.toDate(),
        } as EvidenceUpload;
      });

      setPhotos(photoMap);
      setIsLoading(false);
    });

    return unsubscribe;
  }, [serviceId, instanceId]);

  return { photos, isLoading };
};