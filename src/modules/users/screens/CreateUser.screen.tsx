import React, { useState, useEffect } from 'react';
import {View,StyleSheet,ScrollView,KeyboardAvoidingView, Platform, Alert} from 'react-native';
import {Text,TextInput,Button, Card, HelperText, ActivityIndicator, IconButton, Chip,} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useCreateUser } from '../hooks/useCreateUser';
import { RoleSelector } from '../components/RoleSelector';
import { userService } from '../services/user.service';
import { createUserSchema, CreateUserFormData } from '@/core/validators/user.validator';
import { ROLES } from '@/core/constants/roles.constants';

export const CreateUserScreen = () => {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { isLoading, createUser, getAllowedRoles } = useCreateUser();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);

  const allowedRoles = getAllowedRoles();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      lastName: '',
      phone: '',
      role: undefined,
      assignedProjects: [],
    },
  });

  const selectedRole = watch('role');

  // Cargar proyectos disponibles
  useEffect(() => {
    const loadProjects = async () => {
      const availableProjects = await userService.getAvailableProjects();
      setProjects(availableProjects);
    };
    loadProjects();
  }, []);

  // Actualizar proyectos seleccionados en el formulario
  useEffect(() => {
    setValue('assignedProjects', selectedProjects);
  }, [selectedProjects, setValue]);

  const toggleProject = (projectId: string) => {
    const updatedProjects = selectedProjects.includes(projectId)
    ? selectedProjects.filter(id => id !== projectId)
    : [...selectedProjects, projectId];

    setSelectedProjects(updatedProjects);
    // Actualizamos el valor de react-hook-form inmediatamente
    setValue('assignedProjects', updatedProjects, { 
      shouldValidate: true, // Esto quita el error visual si ya seleccionaste uno
      shouldDirty: true 
    });
    
    /*setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );*/
  };

  const onSubmit = async (data: CreateUserFormData) => {
    // Asegurar que phone tenga un valor (aunque sea vacío)
    const userData = {
      ...data,
      phone: data.phone?.trim() || '', // Si es undefined, lo convierte en string vacío
    };
  
    const result = await createUser(userData);
    if (result.success) {
      router.back();
    }
  };

  // Verificar permisos
  if (!currentUser || (currentUser.role !== ROLES.ADMIN && currentUser.role !== ROLES.COORDINATOR)) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="headlineSmall">Acceso Denegado</Text>
        <Text variant="bodyLarge" style={styles.centerText}>
          No tienes permisos para crear usuarios
        </Text>
        <Button mode="contained" onPress={() => router.back()} style={styles.backButton}>
          Volver
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={24}
            onPress={() => router.back()}
          />
          <Text variant="headlineMedium" style={styles.title}>
            Crear Nuevo Usuario
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {currentUser.role === ROLES.ADMIN 
              ? 'Administrador: Puedes crear cualquier rol'
              : 'Coordinador: Solo puedes crear ingenieros'}
          </Text>
        </View>

        {/* Formulario */}
        <Card style={styles.card} mode="outlined">
          <Card.Content>
            {/* Selector de Rol */}
            <RoleSelector
              selectedRole={selectedRole}
              onSelectRole={(role) => setValue('role', role)}
              allowedRoles={allowedRoles}
              error={errors.role?.message}
            />

            {/* Datos personales */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              👤 Datos Personales
            </Text>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Nombre *"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.name}
                    left={<TextInput.Icon icon="account" />}
                  />
                  {errors.name && (
                    <HelperText type="error">{errors.name.message}</HelperText>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Apellido *"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.lastName}
                    left={<TextInput.Icon icon="account" />}
                  />
                  {errors.lastName && (
                    <HelperText type="error">{errors.lastName.message}</HelperText>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Teléfono (10 dígitos)"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.phone}
                    keyboardType="phone-pad"
                    left={<TextInput.Icon icon="phone" />}
                  />
                  {errors.phone && (
                    <HelperText type="error">{errors.phone.message}</HelperText>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Correo electrónico *"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    left={<TextInput.Icon icon="email" />}
                  />
                  {errors.email && (
                    <HelperText type="error">{errors.email.message}</HelperText>
                  )}
                </View>
              )}
            />

            {/* Contraseñas */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              🔐 Contraseña
            </Text>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Contraseña *"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.password}
                    secureTextEntry={!showPassword}
                    left={<TextInput.Icon icon="lock" />}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                      />
                    }
                  />
                  {errors.password && (
                    <HelperText type="error">{errors.password.message}</HelperText>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputContainer}>
                  <TextInput
                    label="Confirmar contraseña *"
                    mode="outlined"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={!!errors.confirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    left={<TextInput.Icon icon="lock-check" />}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      />
                    }
                  />
                  {errors.confirmPassword && (
                    <HelperText type="error">{errors.confirmPassword.message}</HelperText>
                  )}
                </View>
              )}
            />

            {/* Asignación de proyectos */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              📁 Proyectos Asignados *
            </Text>
            <Text variant="bodySmall" style={styles.projectHint}>
              Selecciona los proyectos a los que tendrá acceso
            </Text>

            <View style={styles.projectsContainer}>
              {projects.map((project) => (
                <Chip
                  key={project.id}
                  selected={selectedProjects.includes(project.id)}
                  onPress={() => toggleProject(project.id)}
                  style={[
                    styles.projectChip,
                    selectedProjects.includes(project.id) && styles.projectChipSelected
                  ]}
                  icon={selectedProjects.includes(project.id) ? 'check' : 'plus'}
                >
                  {project.name}
                </Chip>
              ))}
            </View>

            {errors.assignedProjects && (
              <HelperText type="error" style={styles.projectError}>
                {errors.assignedProjects.message}
              </HelperText>
            )}

            {/* Botones de acción */}
            <View style={styles.actions}>
              <Button
                mode="outlined"
                onPress={() => router.back()}
                style={styles.cancelButton}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit(onSubmit)}
                style={styles.createButton}
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Creando...' : 'Crear Usuario'}
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Info adicional sobre contraseñas */}
        <Card style={styles.infoCard} mode="outlined">
          <Card.Content>
            <Text variant="bodySmall" style={styles.infoText}>
              📌 La contraseña debe tener al menos 6 caracteres, incluir una mayúscula y un número.
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              📌 El usuario recibirá un correo de verificación al iniciar sesión por primera vez.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
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
  centerText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
  backButton: {
    marginTop: 20,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    color: '#1a237e',
    marginTop: 8,
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 12,
  },
  projectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  projectChip: {
    marginBottom: 4,
  },
  projectChipSelected: {
    backgroundColor: '#e8f0fe',
  },
  projectHint: {
    color: '#666',
    marginBottom: 8,
  },
  projectError: {
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#f0f4fa',
    marginTop: 8,
  },
  infoText: {
    color: '#1a237e',
    marginBottom: 4,
  },
});