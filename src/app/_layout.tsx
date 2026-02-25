import { Slot } from 'expo-router';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { AuthProvider } from '@/modules/auth/contexts/AuthContext';
import { SafeScreen } from './components/safeScreen';

// ✅ Prevenir que el layout se re-montere innecesariamente
export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  // Asegurar que el layout inicial se renderice correctamente
  initialRouteName: '(auth)',
};

export default function RootLayout() {


  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider>
          <AuthProvider>
            <StatusBar style="auto" />
            <SafeScreen>
              <Slot />
            </SafeScreen>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});