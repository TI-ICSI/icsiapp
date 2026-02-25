import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, TextInput, IconButton, Switch, HelperText } from 'react-native-paper';
import { Subcategory } from '@/core/types/service.types';

interface Props {
  subcategory: Subcategory;
  onUpdate: (updates: Partial<Subcategory>) => void;
  onRemove: () => void;
  index: number;
}

export const SubcategoryBuilder: React.FC<Props> = ({
  subcategory,
  onUpdate,
  onRemove,
  index,
}) => {
  return (
    <Card style={styles.container} mode="outlined">
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleSmall" style={styles.index}>
            #{index + 1}
          </Text>
          <IconButton
            icon="delete"
            size={20}
            onPress={onRemove}
            iconColor="#d32f2f"
          />
        </View>

        <TextInput
          label="Nombre de la subcategoría"
          mode="outlined"
          value={subcategory.name}
          onChangeText={(text) => onUpdate({ name: text })}
          placeholder="Ej: CPU, Monitor, Pinpad"
          style={styles.input}
        />

        <Text variant="bodySmall" style={styles.sectionLabel}>
          Evidencias requeridas:
        </Text>

        <View style={styles.evidenceRow}>
          <Text>📸 Antes</Text>
          <Switch
            value={subcategory.evidences.before.required}
            onValueChange={(value) =>
              onUpdate({
                evidences: {
                  ...subcategory.evidences,
                  before: { ...subcategory.evidences.before, required: value },
                },
              })
            }
          />
        </View>

        <View style={styles.evidenceRow}>
          <Text>📸 Durante</Text>
          <Switch
            value={subcategory.evidences.during.required}
            onValueChange={(value) =>
              onUpdate({
                evidences: {
                  ...subcategory.evidences,
                  during: { ...subcategory.evidences.during, required: value },
                },
              })
            }
          />
        </View>

        <View style={styles.evidenceRow}>
          <Text>📸 Después</Text>
          <Switch
            value={subcategory.evidences.after.required}
            onValueChange={(value) =>
              onUpdate({
                evidences: {
                  ...subcategory.evidences,
                  after: { ...subcategory.evidences.after, required: value },
                },
              })
            }
          />
        </View>

        <View style={styles.commentRow}>
          <Text>💬 Permitir comentarios</Text>
          <Switch
            value={subcategory.allowComments}
            onValueChange={(value) => onUpdate({ allowComments: value })}
          />
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  index: {
    fontWeight: 'bold',
    color: '#666',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  sectionLabel: {
    fontWeight: '600',
    marginBottom: 8,
  },
  evidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  commentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});