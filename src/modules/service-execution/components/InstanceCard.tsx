import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, ProgressBar, IconButton } from 'react-native-paper';
import { SubcategoryBlock } from './SubcategoryBlock';
import { EvidenceUploader } from './EvidenceUploader';

interface Props {
  instance: any;
  category: any;
  serviceId: string;
  onExpand?: (instanceId: string) => void;
}

export const InstanceCard: React.FC<Props> = ({
  instance,
  category,
  serviceId,
  onExpand,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleExpand = () => {
    setExpanded(!expanded);
    onExpand?.(instance.id);
  };

  // Calcular progreso de esta instancia
  const calculateInstanceProgress = () => {
    let total = 0;
    let completed = 0;

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
    }

    return total > 0 ? completed / total : 0;
  };

  const getStatusColor = (progress: number) => {
    if (progress === 1) return '#4caf50';
    if (progress > 0) return '#ff9800';
    return '#f44336';
  };

  const instanceProgress = calculateInstanceProgress();
  const statusColor = getStatusColor(instanceProgress);

  return (
    <Card style={[styles.container, { borderLeftColor: statusColor }]}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text variant="titleMedium">{instance.name}</Text>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
          <IconButton
            icon={expanded ? 'chevron-up' : 'chevron-down'}
            onPress={toggleExpand}
          />
        </View>

        <ProgressBar
          progress={instanceProgress}
          color={statusColor}
          style={styles.progressBar}
        />

        {expanded && (
          <View style={styles.content}>
            {instance.subcategories ? (
              // Caso Cajas
              instance.subcategories.map((sub: any) => (
                <SubcategoryBlock
                  key={sub.id}
                  subcategory={sub}
                  instanceId={instance.id}
                  serviceId={serviceId}
                />
              ))
            ) : instance.evidences ? (
              // Caso Autocobro
              <View style={styles.evidencesContainer}>
                {instance.evidences.before?.enabled && (
                  <EvidenceUploader
                    serviceId={serviceId}
                    instanceId={instance.id}
                    stage="before"
                    required={instance.evidences.before.required}
                    initialImage={instance.evidences.before.imageUrl}
                  />
                )}
                {instance.evidences.during?.enabled && (
                  <EvidenceUploader
                    serviceId={serviceId}
                    instanceId={instance.id}
                    stage="during"
                    required={instance.evidences.during.required}
                    initialImage={instance.evidences.during.imageUrl}
                  />
                )}
                {instance.evidences.after?.enabled && (
                  <EvidenceUploader
                    serviceId={serviceId}
                    instanceId={instance.id}
                    stage="after"
                    required={instance.evidences.after.required}
                    initialImage={instance.evidences.after.imageUrl}
                  />
                )}
              </View>
            ) : null}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    borderLeftWidth: 4,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressBar: {
    height: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  content: {
    marginTop: 12,
  },
  evidencesContainer: {
    gap: 8,
  },
});