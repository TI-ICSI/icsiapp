import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-community/netinfo';
import { executionService } from '../services/execution.service';
import { UploadQueueItem } from '../types/execution.types';

const db = SQLite.openDatabaseSync('offlineQueue.db');

export const useOfflineQueue = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Inicializar base de datos local
  useEffect(() => {
    db.execAsync(`
      CREATE TABLE IF NOT EXISTS upload_queue (
        id TEXT PRIMARY KEY,
        localUri TEXT NOT NULL,
        remotePath TEXT NOT NULL,
        evidenceData TEXT NOT NULL,
        retries INTEGER DEFAULT 0,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }, []);

  // Monitorear conectividad
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  // Procesar cola cuando hay conexión
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      processQueue();
    }
  }, [isOnline, queue, isProcessing]);

  // Agregar a cola
  const addToQueue = useCallback(async (item: Omit<UploadQueueItem, 'id' | 'retries' | 'timestamp'>) => {
    const id = `queue_${Date.now()}_${Math.random().toString(36)}`;
    const queueItem: UploadQueueItem = {
      id,
      ...item,
      retries: 0,
      timestamp: new Date(),
    };

    // Guardar en SQLite
    await db.runAsync(
      'INSERT INTO upload_queue (id, localUri, remotePath, evidenceData, retries, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
      [
        queueItem.id,
        queueItem.localUri,
        queueItem.remotePath,
        JSON.stringify(queueItem.evidenceData),
        queueItem.retries,
        queueItem.timestamp.toISOString(),
      ]
    );

    setQueue(prev => [...prev, queueItem]);
  }, []);

  // Procesar cola
  const processQueue = useCallback(async () => {
  setIsProcessing(true);

  const items = await db.getAllAsync('SELECT * FROM upload_queue ORDER BY timestamp ASC') as any[];
  
  for (const item of items) {
    try {
      const evidenceData = JSON.parse(item.evidenceData);
      
      await executionService.uploadEvidence(
        item.localUri,
        item.remotePath,
        evidenceData
      );

      await db.runAsync('DELETE FROM upload_queue WHERE id = ?', [item.id]);
      setQueue(prev => prev.filter(q => q.id !== item.id));
      
    } catch (error) {
      console.error('Error processing queue item:', error);
      
      const retries = (item.retries || 0) + 1;
      if (retries < 3) {
        await db.runAsync(
          'UPDATE upload_queue SET retries = ? WHERE id = ?',
          [retries, item.id]
        );
      } else {
        await db.runAsync('DELETE FROM upload_queue WHERE id = ?', [item.id]);
      }
    }
  }

  setIsProcessing(false);
}, []);

  return {
    isOnline,
    queueLength: queue.length,
    addToQueue,
    processQueue,
  };
};