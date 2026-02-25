import React from 'react';
import { View, StyleSheet, ScrollView,  } from 'react-native';
import { Card, Text, List, Chip, Badge, Divider, HelperText } from 'react-native-paper';
import { CategoryBuilder } from '@/core/types/service.types';

interface Props {
  categories: CategoryBuilder[];
}

export const PreviewPanel: React.FC<Props> = ({ categories }) => {
  // Calcular totales
  const totals = categories.reduce(
    (acc, cat) => {
      acc.totalInstances += cat.instanceCount || 0;
      
      if (cat.type === 'with_subcategories') {
        acc.totalSubcategories += cat.baseConfig.subcategories?.length || 0;
        const totalEvidences = (cat.baseConfig.subcategories || []).reduce(
          (sum, sub) => {
            let count = 0;
            if (sub.evidences.before.required) count++;
            if (sub.evidences.during.required) count++;
            if (sub.evidences.after.required) count++;
            return sum + count;
          },
          0
        );
        acc.totalRequiredEvidences += totalEvidences * (cat.instanceCount || 0);
      } else if (cat.type === 'direct_evidences') {
        let count = 0;
        if (cat.baseConfig.evidences?.before.required) count++;
        if (cat.baseConfig.evidences?.during.required) count++;
        if (cat.baseConfig.evidences?.after.required) count++;
        acc.totalRequiredEvidences += count * (cat.instanceCount || 0);
      }
      
      return acc;
    },
    { totalInstances: 0, totalSubcategories: 0, totalRequiredEvidences: 0 }
  );

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'with_subcategories': return '📦';
      case 'direct_evidences': return '💳';
      case 'signature': return '📝';
      default: return '📋';
    }
  };

  return (
    <Card style={styles.container} mode="outlined">
      <Card.Title 
        title="🔍 Vista Previa del Servicio" 
        subtitle={`${categories.length} categorías configuradas`}
      />
      <Card.Content>
        {/* Resumen rápido */}
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Badge style={styles.badge}>{categories.length}</Badge>
            <Text variant="bodySmall">Categorías</Text>
          </View>
          <View style={styles.summaryItem}>
            <Badge style={styles.badge}>{totals.totalInstances}</Badge>
            <Text variant="bodySmall">Instancias</Text>
          </View>
          <View style={styles.summaryItem}>
            <Badge style={styles.badge}>{totals.totalRequiredEvidences}</Badge>
            <Text variant="bodySmall">Evidencias</Text>
          </View>
        </View>

        <Divider style={styles.divider} />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {categories.map((category, index) => (
            <Card key={category.id} style={styles.categoryCard} mode="contained">
              <Card.Content>
                <View style={styles.categoryHeader}>
                  <Text variant="titleMedium">
                    {getCategoryIcon(category.type)} {category.name || `Categoría ${index + 1}`}
                  </Text>
                  <Chip icon="counter" style={styles.instanceChip}>
                    {category.instanceCount || 0} inst.
                  </Chip>
                </View>

                <Text variant="bodySmall" style={styles.typeText}>
                  {category.type === 'with_subcategories' && 'Con subcategorías'}
                  {category.type === 'direct_evidences' && 'Evidencias directas'}
                  {category.type === 'signature' && 'Firma digital'}
                </Text>

                {category.type === 'with_subcategories' && (
                  <View style={styles.subcategoriesPreview}>
                    <Text variant="bodySmall" style={styles.previewLabel}>
                      Subcategorías:
                    </Text>
                    {category.baseConfig.subcategories?.map((sub, idx) => (
                      <List.Item
                        key={sub.id}
                        title={sub.name || `Subcategoría ${idx + 1}`}
                        description={`📸 ${sub.evidences.before.required ? 'A' : ''}${sub.evidences.during.required ? ' D' : ''}${sub.evidences.after.required ? ' Des' : ''}`}
                        left={props => <List.Icon {...props} icon="cog" />}
                        style={styles.subcategoryItem}
                      />
                    ))}
                  </View>
                )}

                {category.type === 'direct_evidences' && (
                  <View style={styles.evidencesPreview}>
                    <Text variant="bodySmall" style={styles.previewLabel}>
                      Evidencias:
                    </Text>
                    <View style={styles.evidenceTags}>
                      {category.baseConfig.evidences?.before.required && (
                        <Chip style={styles.evidenceTag} textStyle={styles.evidenceTagText}>Antes</Chip>
                      )}
                      {category.baseConfig.evidences?.during.required && (
                        <Chip style={styles.evidenceTag} textStyle={styles.evidenceTagText}>Durante</Chip>
                      )}
                      {category.baseConfig.evidences?.after.required && (
                        <Chip style={styles.evidenceTag} textStyle={styles.evidenceTagText}>Después</Chip>
                      )}
                    </View>
                    {category.baseConfig.allowComments && (
                      <Chip icon="comment" style={styles.commentChip}>Comentarios permitidos</Chip>
                    )}
                  </View>
                )}

                {category.type === 'signature' && (
                  <View style={styles.signaturePreview}>
                    <Chip icon="pencil" style={styles.signatureChip}>Firma requerida</Chip>
                  </View>
                )}

                {/* Vista previa de instancias */}
                {category.instanceCount > 0 && (
                  <View style={styles.instancesPreview}>
                    <Text variant="bodySmall" style={styles.previewLabel}>
                      Se generarán:
                    </Text>
                    <View style={styles.instanceList}>
                      {Array.from({ length: Math.min(category.instanceCount, 3) }).map((_, i) => (
                        <Chip key={i} style={styles.instanceTag} textStyle={styles.instanceTagText}>
                          {category.name || 'Item'} {i + 1}
                        </Chip>
                      ))}
                      {category.instanceCount > 3 && (
                        <Text variant="bodySmall" style={styles.moreText}>
                          +{category.instanceCount - 3} más
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>

        <Divider style={styles.divider} />

        {/* Estadísticas finales */}
        <View style={styles.stats}>
          <Text variant="bodyMedium" style={styles.statsTitle}>
            📊 Total del servicio:
          </Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text variant="titleMedium">{totals.totalInstances}</Text>
              <Text variant="bodySmall">Equipos físicos</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleMedium">{totals.totalSubcategories}</Text>
              <Text variant="bodySmall">Subcategorías</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="titleMedium">{totals.totalRequiredEvidences}</Text>
              <Text variant="bodySmall">Fotos requeridas</Text>
            </View>
          </View>
        </View>

        <HelperText type="info" style={styles.footerHelper}>
          Esta es una vista previa. Al publicar se generarán automáticamente todas las instancias.
        </HelperText>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#fff',
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  badge: {
    fontSize: 16,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  categoriesScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryCard: {
    width: 280,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  instanceChip: {
    height: 24,
  },
  typeText: {
    color: '#666',
    marginBottom: 12,
  },
  previewLabel: {
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  subcategoriesPreview: {
    marginTop: 8,
  },
  subcategoryItem: {
    paddingLeft: 0,
    paddingVertical: 2,
  },
  evidencesPreview: {
    marginTop: 8,
  },
  evidenceTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  evidenceTag: {
    backgroundColor: '#e3f2fd',
  },
  evidenceTagText: {
    fontSize: 11,
  },
  commentChip: {
    marginTop: 8,
    backgroundColor: '#fff3e0',
  },
  signaturePreview: {
    marginTop: 8,
  },
  signatureChip: {
    backgroundColor: '#e8f5e8',
  },
  instancesPreview: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  instanceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  instanceTag: {
    backgroundColor: '#e8eaf6',
  },
  instanceTagText: {
    fontSize: 11,
  },
  moreText: {
    color: '#666',
    marginLeft: 4,
  },
  stats: {
    marginTop: 8,
  },
  statsTitle: {
    fontWeight: '600',
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  footerHelper: {
    marginTop: 8,
    textAlign: 'center',
  },
});