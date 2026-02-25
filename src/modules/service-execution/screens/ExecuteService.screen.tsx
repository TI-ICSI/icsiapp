import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl,} from 'react-native';
import { Text, Button, ActivityIndicator, Card, Chip, Dialog, Portal,} from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useServiceExecution } from '../hooks/useServiceExecution';
import { InstanceCard } from '../components/InstanceCard';
import { SignaturePad } from '../components/SignaturePad';

export const ExecuteServiceScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { service, isLoading, error, progress, completeService, isOnline } = 
    useServiceExecution(id);
  
  const [refreshing, setRefreshing] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [currentSignatureInstance, setCurrentSignatureInstance] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !service) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall">Error</Text>
        <Text variant="bodyLarge">{error || 'Servicio no encontrado'}</Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.button}>
          Volver
        </Button>
      </View>
    );
  }

  const handleComplete = () => {
    completeService();
  };

  const handleSignatureRequest = (instanceId: string) => {
    setCurrentSignatureInstance(instanceId);
    setShowSignature(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {}} />
        }
      >
        {/* Header */}
        <Card style={styles.headerCard} mode="outlined">
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              {service.title}
            </Text>
            <Text variant="bodyLarge" style={styles.client}>
              Cliente: {service.clientName}
            </Text>
            {service.location && (
              <Text variant="bodyMedium" style={styles.location}>
                📍 {service.location}
              </Text>
            )}
            
            <View style={styles.statusContainer}>
              <Chip icon={isOnline ? 'wifi' : 'wifi-off'} style={styles.statusChip}>
                {isOnline ? 'En línea' : 'Offline'}
              </Chip>
              <Chip icon="progress-check" style={styles.statusChip}>
                {Math.round(progress.percentage)}% Completado
              </Chip>
            </View>

            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress.percentage}%` }
                ]} 
              />
            </View>
          </Card.Content>
        </Card>

        {/* Instancias por categoría */}
        {service.categories.map((category) => (
          <View key={category.id} style={styles.categoryContainer}>
            <View style={styles.categoryHeader}>
              <Text variant="titleMedium" style={styles.categoryTitle}>
                {category.name}
              </Text>
              <Chip style={styles.instanceCount}>
                {category.instances.length} instancias
              </Chip>
            </View>

            {category.instances.map((instance) => (
              <InstanceCard
                key={instance.id}
                instance={instance}
                category={category}
                serviceId={service.id}
              />
            ))}

            {/* Si es categoría de firma */}
            {category.type === 'signature' && (
              <Button
                mode="contained"
                onPress={() => handleSignatureRequest(category.instances[0].id)}
                icon="pencil"
                style={styles.signatureButton}
              >
                Capturar Firma
              </Button>
            )}
          </View>
        ))}

        {/* Resumen */}
        <Card style={styles.summaryCard} mode="outlined">
          <Card.Content>
            <Text variant="titleMedium" style={styles.summaryTitle}>
              📊 Resumen
            </Text>
            <View style={styles.summaryRow}>
              <Text>Evidencias completadas:</Text>
              <Text style={styles.summaryValue}>
                {progress.completed}/{progress.total}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Botón finalizar */}
        <Button
          mode="contained"
          onPress={handleComplete}
          style={styles.completeButton}
          disabled={!isOnline}
        >
          {progress.completed === progress.total 
            ? '✅ Finalizar Servicio' 
            : '⏸️ Marcar como Completado'}
        </Button>
      </ScrollView>

      {/* Modal de firma */}
      <Portal>
        <Dialog
          visible={showSignature}
          onDismiss={() => setShowSignature(false)}
          style={styles.signatureDialog}
        >
          <Dialog.Title>Firma del Cliente</Dialog.Title>
          <Dialog.Content>
            {currentSignatureInstance && (
              <SignaturePad
                instanceId={currentSignatureInstance}
                serviceId={service.id}
                onSave={() => setShowSignature(false)}
                onCancel={() => setShowSignature(false)}
              />
            )}
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    marginTop: 16,
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  client: {
    color: '#666',
    marginBottom: 4,
  },
  location: {
    color: '#999',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  statusChip: {
    backgroundColor: '#f0f0f0',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1a237e',
    borderRadius: 4,
  },
  categoryContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontWeight: '600',
  },
  instanceCount: {
    backgroundColor: '#e0e0e0',
  },
  signatureButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  summaryCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  summaryTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryValue: {
    fontWeight: 'bold',
    color: '#1a237e',
  },
  completeButton: {
    margin: 16,
    paddingVertical: 8,
    backgroundColor: '#1a237e',
  },
  signatureDialog: {
    backgroundColor: '#fff',
  },
});