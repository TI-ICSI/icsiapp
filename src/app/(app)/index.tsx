import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, Avatar, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export default function DashboardScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleName = (role: string) => {
    const roles = {
      admin: 'Administrador',
      coordinator: 'Coordinador',
      engineer: 'Ingeniero',
    };
    return roles[role as keyof typeof roles] || role;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Icon 
          size={80} 
          icon="account" 
          style={{ backgroundColor: theme.colors.primary }}
        />
        <Text variant="headlineMedium" style={styles.welcome}>
          ¡Bienvenido!
        </Text>
        <Text variant="titleMedium" style={styles.name}>
          {user?.name} {user?.lastName}
        </Text>
        <Card style={styles.roleCard}>
          <Card.Content>
            <Text variant="bodyLarge">Rol: {getRoleName(user?.role || '')}</Text>
            <Text variant="bodyMedium">Email: {user?.email}</Text>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.menu}>
        <Text variant="titleLarge" style={styles.menuTitle}>
          Módulos
        </Text>

        {user?.role === 'admin' || user?.role === 'coordinator' ? (
          <Card style={styles.menuCard} onPress={() => router.push('/(app)/services/builder')}>
            <Card.Content style={styles.menuCardContent}>
              <Avatar.Icon size={48} icon="hammer" />
              <View style={styles.menuText}>
                <Text variant="titleMedium">Constructor de Servicios</Text>
                <Text variant="bodySmall">Crear nuevo servicio de mantenimiento</Text>
              </View>
            </Card.Content>
          </Card>
        ) : null}

        <Card style={styles.menuCard} onPress={() => router.push('/(app)/services')}>
          <Card.Content style={styles.menuCardContent}>
            <Avatar.Icon size={48} icon="clipboard-list" />
            <View style={styles.menuText}>
              <Text variant="titleMedium">Mis Servicios</Text>
              <Text variant="bodySmall">
                {user?.role === 'engineer' 
                  ? 'Servicios asignados' 
                  : 'Gestionar servicios'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.menuCard} onPress={() => router.push('/(app)/profile')}>
          <Card.Content style={styles.menuCardContent}>
            <Avatar.Icon size={48} icon="account-cog" />
            <View style={styles.menuText}>
              <Text variant="titleMedium">Mi Perfil</Text>
              <Text variant="bodySmall">Actualizar información</Text>
            </View>
          </Card.Content>
        </Card>

        <Button 
          mode="outlined" 
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Cerrar Sesión
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcome: {
    marginTop: 16,
    fontWeight: 'bold',
  },
  name: {
    marginTop: 4,
    color: '#666',
  },
  roleCard: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#f0f2f5',
  },
  menu: {
    padding: 20,
  },
  menuTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  menuCard: {
    marginBottom: 12,
    elevation: 2,
  },
  menuCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    marginLeft: 16,
    flex: 1,
  },
  logoutButton: {
    marginTop: 20,
    borderColor: '#d32f2f',
    borderWidth: 1,
  },
});