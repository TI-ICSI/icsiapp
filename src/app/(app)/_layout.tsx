import { Stack } from 'expo-router';
import { ProtectedRoute } from '@/modules/auth/components/ProtectedRoute';

export default function AppLayout() {
  return (
    <ProtectedRoute>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
        <Stack.Screen name="profile" options={{ title: 'Mi Perfil' }} />
        <Stack.Screen name="services" options={{ title: 'Servicios' }} />
      </Stack>
    </ProtectedRoute>
  );
}