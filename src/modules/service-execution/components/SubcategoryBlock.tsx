import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { EvidenceUploader } from './EvidenceUploader';

interface Props {
  subcategory: any;
  instanceId: string;
  serviceId: string;
}

export const SubcategoryBlock: React.FC<Props> = ({
  subcategory,
  instanceId,
  serviceId,
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Divider style={styles.divider} />
      
      <View style={styles.header}>
        <Text variant="titleSmall" style={styles.title}>
          {subcategory.name}
        </Text>
      </View>

      <View style={styles.evidences}>
        {subcategory.evidences.before?.enabled && (
          <EvidenceUploader
            serviceId={serviceId}
            instanceId={instanceId}
            subcategoryId={subcategory.id}
            stage="before"
            required={subcategory.evidences.before.required}
            initialImage={subcategory.evidences.before.imageUrl}
          />
        )}
        
        {subcategory.evidences.during?.enabled && (
          <EvidenceUploader
            serviceId={serviceId}
            instanceId={instanceId}
            subcategoryId={subcategory.id}
            stage="during"
            required={subcategory.evidences.during.required}
            initialImage={subcategory.evidences.during.imageUrl}
          />
        )}
        
        {subcategory.evidences.after?.enabled && (
          <EvidenceUploader
            serviceId={serviceId}
            instanceId={instanceId}
            subcategoryId={subcategory.id}
            stage="after"
            required={subcategory.evidences.after.required}
            initialImage={subcategory.evidences.after.imageUrl}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  divider: {
    marginVertical: 8,
  },
  header: {
    marginBottom: 8,
  },
  title: {
    fontWeight: '600',
    color: '#1a237e',
  },
  evidences: {
    gap: 4,
  },
});