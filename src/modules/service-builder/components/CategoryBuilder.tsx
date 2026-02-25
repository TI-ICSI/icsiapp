import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TextInput, IconButton, Button, Chip, Divider } from 'react-native-paper';
import { CategoryBuilder as CategoryBuilderType } from '@/core/types/service.types';
import { InstanceCounter } from './InstanceCounter';
import { SubcategoryBuilder } from './SubcategoryBuilder';
import { EvidenceConfigurator } from './EvidenceConfigurator';
import { useCategoryManagement } from '../hooks/useCategoryManagement';

interface Props {
  category: CategoryBuilderType;
  onUpdate: (updates: Partial<CategoryBuilderType>) => void;
  onRemove: () => void;
}

export const CategoryBuilder: React.FC<Props> = ({ category, onUpdate, onRemove }) => {
  const {
    updateName,
    updateInstanceCount,
    addSubcategory,
    removeSubcategory,
    updateSubcategory,
    toggleEvidence,
    toggleComments,
  } = useCategoryManagement(category, onUpdate);

  const getCategoryIcon = () => {
    switch (category.type) {
      case 'with_subcategories': return '📦';
      case 'direct_evidences': return '💳';
      case 'signature': return '📝';
    }
  };

  const getCategoryTypeName = () => {
    switch (category.type) {
      case 'with_subcategories': return 'Con subcategorías (Cajas)';
      case 'direct_evidences': return 'Evidencias directas (Autocobro)';
      case 'signature': return 'Firma (Hoja de Servicio)';
    }
  };

  return (
    <Card style={styles.container} mode="elevated">
      <Card.Title
        title={
          <View style={styles.titleContainer}>
            <Text variant="titleLarge" style={styles.titleText}>
              {getCategoryIcon()} {category.name || 'Nueva Categoría'}
            </Text>
            <Chip icon="information" style={styles.typeChip}>
              {getCategoryTypeName()}
            </Chip>
          </View>
        }
        right={() => (
          <IconButton
            icon="delete"
            onPress={onRemove}
            iconColor="#d32f2f"
          />
        )}
      />

      <Card.Content>
        {/* Nombre de la categoría */}
        <TextInput
          label="Nombre de la categoría"
          mode="outlined"
          value={category.name}
          onChangeText={updateName}
          placeholder="Ej: Cajas, Autocobro, etc"
          style={styles.input}
        />

        {/* Contador de instancias (si no es firma) */}
        {category.type !== 'signature' && (
          <InstanceCounter
            value={category.instanceCount}
            onChange={updateInstanceCount}
            categoryName={category.name || 'esta categoría'}
          />
        )}

        <Divider style={styles.divider} />

        {/* Configuración específica según tipo */}
        {category.type === 'with_subcategories' && (
          <View>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Subcategorías (CPU, Monitor, etc)
            </Text>
            
            {category.baseConfig.subcategories?.map((sub, index) => (
              <SubcategoryBuilder
                key={sub.id}
                subcategory={sub}
                onUpdate={(updates) => updateSubcategory(sub.id, updates)}
                onRemove={() => removeSubcategory(sub.id)}
                index={index}
              />
            ))}

            <Button
              mode="outlined"
              onPress={addSubcategory}
              icon="plus"
              style={styles.addButton}
            >
              Agregar Subcategoría
            </Button>
          </View>
        )}

        {category.type === 'direct_evidences' && (
          <EvidenceConfigurator
            evidences={category.baseConfig.evidences!}
            allowComments={category.baseConfig.allowComments || false}
            onToggleEvidence={toggleEvidence}
            onToggleComments={toggleComments}
          />
        )}

        {category.type === 'signature' && (
          <View style={styles.signatureContainer}>
            <Text variant="bodyLarge">
              ✍️ Se requerirá firma del cliente
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  titleContainer: {
    flex: 1,
  },
  titleText: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 12,
    fontWeight: '600',
  },
  addButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  signatureContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    alignItems: 'center',
  },
});