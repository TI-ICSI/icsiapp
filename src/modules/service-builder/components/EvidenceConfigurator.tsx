import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Switch, Divider, HelperText } from 'react-native-paper';
import { EvidenceConfig } from '@/core/types/service.types';

interface Props {
  evidences: {
    before: EvidenceConfig;
    during: EvidenceConfig;
    after: EvidenceConfig;
  };
  allowComments: boolean;
  onToggleEvidence: (evidenceType: 'before' | 'during' | 'after', field: 'required' | 'enabled') => void;
  onToggleComments: () => void;
}

export const EvidenceConfigurator: React.FC<Props> = ({
  evidences,
  allowComments,
  onToggleEvidence,
  onToggleComments,
}) => {
  return (
    <Card style={styles.container} mode="outlined">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          📸 Configuración de Evidencias
        </Text>

        <View style={styles.evidenceSection}>
          <Text variant="bodyLarge" style={styles.sectionTitle}>
            Evidencias requeridas:
          </Text>

          {/* Antes */}
          <View style={styles.evidenceRow}>
            <View style={styles.evidenceInfo}>
              <Text variant="bodyMedium" style={styles.evidenceLabel}>📸 Antes</Text>
              <Text variant="bodySmall" style={styles.evidenceDesc}>
                Foto del equipo antes del mantenimiento
              </Text>
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Requerido</Text>
              <Switch
                value={evidences.before.required}
                onValueChange={(value) => onToggleEvidence('before', 'required')}
                disabled={!evidences.before.enabled}
              />
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Durante */}
          <View style={styles.evidenceRow}>
            <View style={styles.evidenceInfo}>
              <Text variant="bodyMedium" style={styles.evidenceLabel}>📸 Durante</Text>
              <Text variant="bodySmall" style={styles.evidenceDesc}>
                Foto durante el mantenimiento
              </Text>
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Requerido</Text>
              <Switch
                value={evidences.during.required}
                onValueChange={(value) => onToggleEvidence('during', 'required')}
                disabled={!evidences.during.enabled}
              />
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Después */}
          <View style={styles.evidenceRow}>
            <View style={styles.evidenceInfo}>
              <Text variant="bodyMedium" style={styles.evidenceLabel}>📸 Después</Text>
              <Text variant="bodySmall" style={styles.evidenceDesc}>
                Foto del equipo después del mantenimiento
              </Text>
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Requerido</Text>
              <Switch
                value={evidences.after.required}
                onValueChange={(value) => onToggleEvidence('after', 'required')}
                disabled={!evidences.after.enabled}
              />
            </View>
          </View>
        </View>

        <Divider style={styles.mainDivider} />

        {/* Configuración de comentarios */}
        <View style={styles.commentSection}>
          <View style={styles.commentHeader}>
            <View>
              <Text variant="bodyLarge" style={styles.sectionTitle}>
                💬 Comentarios
              </Text>
              <Text variant="bodySmall" style={styles.commentDesc}>
                Permitir que el ingeniero agregue comentarios
              </Text>
            </View>
            <Switch
              value={allowComments}
              onValueChange={onToggleComments}
            />
          </View>
        </View>

        <HelperText type="info" style={styles.helper}>
          Las evidencias marcadas como requeridas serán obligatorias para el ingeniero
        </HelperText>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    backgroundColor: '#fff',
  },
  title: {
    marginBottom: 16,
    fontWeight: '600',
  },
  evidenceSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  evidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  evidenceInfo: {
    flex: 1,
    marginRight: 16,
  },
  evidenceLabel: {
    fontWeight: '500',
    marginBottom: 2,
  },
  evidenceDesc: {
    color: '#666',
  },
  switchContainer: {
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  divider: {
    marginVertical: 4,
  },
  mainDivider: {
    marginVertical: 16,
  },
  commentSection: {
    marginTop: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentDesc: {
    color: '#666',
    marginTop: 2,
  },
  helper: {
    marginTop: 12,
    fontStyle: 'italic',
  },
});