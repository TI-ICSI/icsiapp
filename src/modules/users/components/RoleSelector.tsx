import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, HelperText } from 'react-native-paper';
import { UserRole } from '@/core/types/global.types';
import { ROLE_NAMES, ROLE_DESCRIPTIONS } from '@/core/constants/roles.constants';

interface Props {
  selectedRole: UserRole | null;
  onSelectRole: (role: UserRole) => void;
  allowedRoles: UserRole[];
  error?: string;
}

export const RoleSelector: React.FC<Props> = ({
  selectedRole,
  onSelectRole,
  allowedRoles,
  error,
}) => {
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return '👑';
      case 'coordinator': return '📋';
      case 'engineer': return '🔧';
      default: return '👤';
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin': return '#d32f2f';
      case 'coordinator': return '#1976d2';
      case 'engineer': return '#388e3c';
      default: return '#757575';
    }
  };

  if (allowedRoles.length === 0) {
    return (
      <View style={styles.container}>
        <Text variant="bodyMedium" style={styles.noPermission}>
          No tienes permiso para crear usuarios
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.label}>
        Rol del usuario *
      </Text>

      <View style={styles.rolesContainer}>
        {allowedRoles.map((role) => (
          <Chip
            key={role}
            selected={selectedRole === role}
            onPress={() => onSelectRole(role)}
            style={[
              styles.roleChip,
              selectedRole === role && { 
                backgroundColor: getRoleColor(role) + '20',
                borderColor: getRoleColor(role),
              }
            ]}
            textStyle={[
              styles.roleText,
              selectedRole === role && { color: getRoleColor(role) }
            ]}
            icon={() => (
              <Text style={styles.roleIcon}>{getRoleIcon(role)}</Text>
            )}
          >
            {ROLE_NAMES[role]}
          </Chip>
        ))}
      </View>

      {selectedRole && (
        <HelperText type="info" style={styles.description}>
          {ROLE_DESCRIPTIONS[selectedRole]}
        </HelperText>
      )}

      {error && (
        <HelperText type="error">{error}</HelperText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 12,
    fontWeight: '600',
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roleText: {
    fontSize: 14,
  },
  roleIcon: {
    fontSize: 16,
  },
  description: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  noPermission: {
    color: '#d32f2f',
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
});