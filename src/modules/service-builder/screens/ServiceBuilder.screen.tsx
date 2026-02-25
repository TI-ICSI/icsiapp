import React, { useState, useEffect  } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, TouchableOpacity} from 'react-native';
import { Text, Button, Card, TextInput, HelperText, ActivityIndicator, Menu, Divider, FAB, Portal, Dialog,
RadioButton, Chip, Avatar, Searchbar,} from 'react-native-paper';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useServiceBuilder } from '../hooks/useServiceBuilder';
import { CategoryBuilder } from '../components/CategoryBuilder';
import { PreviewPanel } from '../components/PreviewPanel';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { userService } from '@/modules/users/services/user.service';
import { AppUser } from '@/core/types/global.types';

export const ServiceBuilderScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const {
    service,
    isSaving,
    isValid,
    updateServiceField,
    addCategory,
    updateCategory,
    removeCategory,
    moveCategory,
    saveService,
  } = useServiceBuilder();

  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Estados para proyectos filtrados por rol
  const [availableProjects, setAvailableProjects] = useState<{ id: string; name: string }[]>([]);

  // Estados para búsqueda de ingenieros
  const [engineerSearchQuery, setEngineerSearchQuery] = useState('');
  const [showEngineerSearch, setShowEngineerSearch] = useState(false);
  const [availableEngineers, setAvailableEngineers] = useState<AppUser[]>([]);
  const [selectedEngineers, setSelectedEngineers] = useState<AppUser[]>([]);
  const [isLoadingEngineers, setIsLoadingEngineers] = useState(false);

   // Cargar proyectos según el rol del usuario
  useEffect(() => {
    const loadProjects = async () => {
      if (!user) return;

      // Proyectos base
      const allProjects = [
        { id: 'toshiba', name: 'Toshiba' },
        { id: 'similares', name: 'Similares' },
      ];

      if (user.role === 'admin') {
        // Admin: ve todos los proyectos
        setAvailableProjects(allProjects);
      } else {
        // Coordinador: solo ve sus proyectos asignados
        const filtered = allProjects.filter(p => 
          user.assignedProjects?.includes(p.id)
        );
        setAvailableProjects(filtered);
        
        // Si solo tiene un proyecto, seleccionarlo automáticamente
        if (filtered.length === 1) {
          updateServiceField('projectId', filtered[0].id);
        }
      }
    };

    loadProjects();
  }, [user]);

  // Cargar ingenieros cuando se selecciona un proyecto
  useEffect(() => {
    const loadEngineers = async () => {
      if (!service.projectId) return;
      
      setIsLoadingEngineers(true);
      try {
        const engineers = await userService.getEngineersByProject(service.projectId);
        setAvailableEngineers(engineers);
      } catch (error) {
        console.error('Error loading engineers:', error);
      } finally {
        setIsLoadingEngineers(false);
      }
    };

    loadEngineers();
  }, [service.projectId]);

  // Filtrar ingenieros por búsqueda
  const filteredEngineers = availableEngineers.filter(eng => 
    `${eng.name} ${eng.lastName}`.toLowerCase().includes(engineerSearchQuery.toLowerCase()) ||
    eng.email.toLowerCase().includes(engineerSearchQuery.toLowerCase())
  );
  
  const toggleEngineer = (engineer: AppUser) => {
    setSelectedEngineers(prev => {
      const isSelected = prev.some(e => e.uid === engineer.uid);
      if (isSelected) {
        return prev.filter(e => e.uid !== engineer.uid);
      } else {
        return [...prev, engineer];
      }
    });
  };

  const handleSave = async () => {
  try {
    const serviceData ={
      ...service,
      assignedTo: selectedEngineers.map(e => e.uid)
    }
    updateServiceField('assignedTo', selectedEngineers.map(e => e.uid))

    const serviceId = await saveService(serviceData)
    setShowConfirmDialog(true);
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

  const handleConfirmSuccess = () => {
    setShowConfirmDialog(false);
    router.push('/(app)/services');
  };

  if (!user || (user.role !== 'admin' && user.role !== 'coordinator')) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall">Acceso Denegado</Text>
        <Text variant="bodyLarge">Solo administradores y coordinadores pueden crear servicios</Text>
      </View>
    );
  }

  useEffect(() => {
    const assignedTo = selectedEngineers.map(e => e.uid);
    updateServiceField('assignedTo', assignedTo);
  }, [selectedEngineers]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Datos básicos del servicio */}
        <Card style={styles.card} mode="outlined">
          <Card.Title title="📋 Datos del Servicio" />
          <Card.Content>
            <TextInput
              label="Título del servicio *"
              mode="outlined"
              value={service.title}
              onChangeText={(text) => updateServiceField('title', text)}
              placeholder="Ej: Mantenimiento Sucursal Centro"
              style={styles.input}
            />

            <TextInput
              label="Cliente *"
              mode="outlined"
              value={service.clientName}
              onChangeText={(text) => updateServiceField('clientName', text)}
              placeholder="Nombre del cliente"
              style={styles.input}
            />

            <TextInput
              label="Localidad"
              mode="outlined"
              value={service.location}
              onChangeText={(text) => updateServiceField('location', text)}
              placeholder="Dirección del servicio"
              style={styles.input}
              multiline
              numberOfLines={2}
            />

            <View style={styles.row}>
              <Menu
                visible={showProjectMenu}
                onDismiss={() => setShowProjectMenu(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setShowProjectMenu(true)}
                    style={styles.projectButton}
                    icon="chevron-down"
                  >
                    {service.projectId 
                      ? availableProjects.find(p => p.id === service.projectId)?.name 
                      : 'Seleccionar Proyecto *'}
                  </Button>
                }
              >
                {availableProjects.map((project) => (
                  <Menu.Item
                    key={project.id}
                    onPress={() => {
                      updateServiceField('projectId', project.id);
                      setShowProjectMenu(false);
                    }}
                    title={project.name}
                  />
                ))}
              </Menu>

              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
                icon="calendar"
              >
                {service.scheduledDate.toLocaleDateString()}
              </Button>
            </View>

            {showDatePicker && (
              <DateTimePicker
                value={service.scheduledDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    updateServiceField('scheduledDate', selectedDate);
                  }
                }}
              />
            )}

            {/* Selector de Ingenieros */}
            {service.projectId && (
              <View style={styles.engineerSection}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  👷 Asignar Ingenieros
                </Text>
                
                <Button
                  mode="outlined"
                  onPress={() => setShowEngineerSearch(!showEngineerSearch)}
                  icon="account-plus"
                  style={styles.addEngineerButton}
                >
                  {selectedEngineers.length > 0 
                    ? `${selectedEngineers.length} ingeniero(s) seleccionado(s)`
                    : 'Buscar ingenieros'}
                </Button>

                {showEngineerSearch && (
                  <Card style={styles.engineerSearchCard} mode="outlined">
                    <Card.Content>
                      <Searchbar
                        placeholder="Buscar ingeniero por nombre o email"
                        onChangeText={setEngineerSearchQuery}
                        value={engineerSearchQuery}
                        style={styles.searchbar}
                      />

                      {isLoadingEngineers ? (
                        <ActivityIndicator style={styles.loading} />
                      ) : (
                        <ScrollView style={styles.engineerList}>
                          {filteredEngineers.map((engineer) => {
                            const isSelected = selectedEngineers.some(e => e.uid === engineer.uid);
                            return (
                              <TouchableOpacity
                                key={engineer.uid}
                                style={[
                                  styles.engineerItem,
                                  isSelected && styles.engineerItemSelected
                                ]}
                                onPress={() => toggleEngineer(engineer)}
                              >
                                <View style={styles.engineerItemContent}>
                                  <Avatar.Text 
                                    size={40} 
                                    label={`${engineer.name[0]}${engineer.lastName[0]}`}
                                  />
                                  <View style={styles.engineerInfo}>
                                    <Text variant="bodyMedium">
                                      {engineer.name} {engineer.lastName}
                                    </Text>
                                    <Text variant="bodySmall" style={styles.engineerEmail}>
                                      {engineer.email}
                                    </Text>
                                  </View>
                                  {isSelected && (
                                    <Chip icon="check" style={styles.selectedChip}>
                                      Seleccionado
                                    </Chip>
                                  )}
                                </View>
                              </TouchableOpacity>
                            );
                          })}
                          {filteredEngineers.length === 0 && (
                            <Text style={styles.noResults}>
                              No se encontraron ingenieros
                            </Text>
                          )}
                        </ScrollView>
                      )}
                    </Card.Content>
                  </Card>
                )}

                {selectedEngineers.length > 0 && (
                  <View style={styles.selectedEngineers}>
                    <Text variant="bodySmall" style={styles.selectedLabel}>
                      Ingenieros seleccionados:
                    </Text>
                    <View style={styles.selectedChips}>
                      {selectedEngineers.map((engineer) => (
                        <Chip
                          key={engineer.uid}
                          onClose={() => toggleEngineer(engineer)}
                          style={styles.selectedChip}
                        >
                          {engineer.name} {engineer.lastName}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            )}

          </Card.Content>
        </Card>

        {/* Categorías */}
        <Card style={styles.card} mode="outlined">
          <Card.Title title="📦 Categorías" />
          <Card.Content>
            {service.categories.length === 0 ? (
              <View style={styles.emptyCategories}>
                <Text variant="bodyLarge" style={styles.emptyText}>
                  No hay categorías agregadas
                </Text>
                <Text variant="bodyMedium" style={styles.emptySubtext}>
                  Presiona el botón + para agregar una categoría
                </Text>
              </View>
            ) : (
              service.categories.map((category, index) => (
                <CategoryBuilder
                  key={category.id}
                  category={category}
                  onUpdate={(updates) => updateCategory(category.id, updates)}
                  onRemove={() => removeCategory(category.id)}
                />
              ))
            )}

            <Menu
              visible={showCategoryMenu}
              onDismiss={() => setShowCategoryMenu(false)}
              anchor={
                <Button
                  mode="contained"
                  onPress={() => setShowCategoryMenu(true)}
                  icon="plus"
                  style={styles.addCategoryButton}
                  disabled={isSaving}
                >
                  Agregar Categoría
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  addCategory('with_subcategories');
                  setShowCategoryMenu(false);
                }}
                title="📦 Con subcategorías (Cajas)"
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  addCategory('direct_evidences');
                  setShowCategoryMenu(false);
                }}
                title="💳 Evidencias directas (Autocobro)"
              />
              <Divider />
              <Menu.Item
                onPress={() => {
                  addCategory('signature');
                  setShowCategoryMenu(false);
                }}
                title="📝 Hoja de Servicio"
              />
            </Menu>
          </Card.Content>
        </Card>

        {/* Vista Previa */}
        {service.categories.length > 0 && (
          <PreviewPanel categories={service.categories} />
        )}

        {/* Botón Guardar */}
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          disabled={isSaving}
          loading={isSaving}
        >
          {isSaving ? 'Publicando...' : 'Publicar Servicio'}
        </Button>
      </ScrollView>

      {/* Diálogo de éxito */}
      <Portal>
        <Dialog visible={showConfirmDialog} onDismiss={handleConfirmSuccess}>
          <Dialog.Title>✅ Servicio Publicado</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge">
              El servicio se ha creado exitosamente con:
            </Text>
            {service.categories.map((cat, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text variant="bodyMedium">
                  • {cat.name}: {cat.instanceCount} instancia(s)
                </Text>
              </View>
            ))}
            <Text variant="bodyMedium" style={styles.summaryEngineers}>
              • {selectedEngineers.length} ingeniero(s) asignado(s)
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleConfirmSuccess}>Ver Servicios</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  projectButton: {
    flex: 1,
  },
  dateButton: {
    flex: 1,
  },
  engineerSection: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  addEngineerButton: {
    marginBottom: 12,
  },
  engineerSearchCard: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  searchbar: {
    marginBottom: 12,
  },
  loading: {
    padding: 20,
  },
  engineerList: {
    maxHeight: 200,
  },
  engineerItem: {
    marginVertical: 4,
    backgroundColor: '#fff',
  },
  engineerItemSelected: {
    backgroundColor: '#e8f0fe',
  },
  engineerItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  engineerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  engineerEmail: {
    color: '#666',
  },
  selectedChip: {
    backgroundColor: '#1a237e',
  },
  noResults: {
    textAlign: 'center',
    padding: 16,
    color: '#666',
  },
  selectedEngineers: {
    marginTop: 8,
  },
  selectedLabel: {
    marginBottom: 8,
    color: '#666',
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyCategories: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 8,
    marginBottom: 16,
  },
  emptyText: {
    color: '#666',
    marginBottom: 4,
  },
  emptySubtext: {
    color: '#999',
  },
  addCategoryButton: {
    marginTop: 8,
  },
  saveButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  summaryItem: {
    marginTop: 8,
    marginLeft: 8,
  },
  summaryEngineers: {
    marginTop: 12,
    fontWeight: '600',
  },
});