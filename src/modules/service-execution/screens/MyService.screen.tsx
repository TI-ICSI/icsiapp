import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Chip, Searchbar, ActivityIndicator, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { executionService } from '../services/execution.service';
import { ServiceWithProgress } from '../types/execution.types';
import { ROLES } from '@/core/constants/roles.constants';

export const MyServicesScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceWithProgress[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery, filter]);

  const loadServices = async () => {
    if (!user) return;
    
    try {
      const userServices = await executionService.getUserServices(user.uid, user.role);
      setServices(userServices);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const filterServices = () => {
    let filtered = [...services];

    // Filtrar por estado
    if (filter !== 'all') {
      filtered = filtered.filter(s => s.status === filter);
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.clientName.toLowerCase().includes(query) ||
        s.location?.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'in_progress': return '#1976d2';
      case 'completed': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'in_progress': return 'En Progreso';
      case 'completed': return 'Completado';
      default: return status;
    }
  };

  const renderServiceCard = ({ item }: { item: ServiceWithProgress }) => {
  // Función helper para formatear fecha
  const formatDate = (date: any): string => {
    if (!date) return 'Fecha no disponible';
    
    try {
      if (date instanceof Date) {
        return date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
      if (date?.toDate && typeof date.toDate === 'function') {
        return date.toDate().toLocaleDateString('es-ES');
      }
      return new Date(date).toLocaleDateString('es-ES');
    } catch {
      return 'Fecha no disponible';
    }
  };

  return (
    <Card 
      style={styles.card} 
      onPress={() => router.push(`/(app)/services/${item.id}`)}
    >
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleMedium" style={styles.cardTitle}>{item.title}</Text>
          <Chip 
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) + '20' }]}
            textStyle={{ color: getStatusColor(item.status) }}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        <Text variant="bodyMedium" style={styles.clientName}>{item.clientName}</Text>
        {item.location && (
          <Text variant="bodySmall" style={styles.location}>📍 {item.location}</Text>
        )}

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${item.progress}%`, backgroundColor: getStatusColor(item.status) }
              ]} 
            />
          </View>
          <Text variant="bodySmall" style={styles.progressText}>
            {item.completedEvidences}/{item.totalEvidences}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text variant="bodySmall" style={styles.date}>
            📅 {formatDate(item.scheduledDate)} {/* 👈 CORREGIDO */}
          </Text>
          <Chip icon="folder" style={styles.projectChip}>
            {item.projectId === 'toshiba' ? 'Toshiba' : 'Similares'}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
};

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Buscar servicios..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <View style={styles.filterContainer}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={styles.filterChip}
        >
          Todos
        </Chip>
        <Chip
          selected={filter === 'pending'}
          onPress={() => setFilter('pending')}
          style={styles.filterChip}
        >
          Pendientes
        </Chip>
        <Chip
          selected={filter === 'in_progress'}
          onPress={() => setFilter('in_progress')}
          style={styles.filterChip}
        >
          En Progreso
        </Chip>
        <Chip
          selected={filter === 'completed'}
          onPress={() => setFilter('completed')}
          style={styles.filterChip}
        >
          Completados
        </Chip>
      </View>

      <FlatList
        data={filteredServices}
        renderItem={renderServiceCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadServices();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge">No hay servicios disponibles</Text>
          </View>
        }
      />

      {(user?.role === ROLES.ADMIN || user?.role === ROLES.COORDINATOR) && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/(app)/services/builder')}
        />
      )}
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
  },
  searchbar: {
    margin: 16,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  filterChip: {
    marginRight: 4,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    flex: 1,
    fontWeight: '600',
  },
  statusChip: {
    height: 28,
  },
  clientName: {
    color: '#666',
    marginBottom: 4,
  },
  location: {
    color: '#999',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  date: {
    color: '#999',
  },
  projectChip: {
    height: 24,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a237e',
  },
});