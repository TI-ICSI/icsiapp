// components/common/SafeScreen.tsx
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const SafeScreen = ({ children, style }: SafeScreenProps) => {
  const insets = useSafeAreaInsets(); // ✅ Aquí obtenemos los valores del SafeAreaProvider

  return (
    <View 
      style={[
        {
          flex: 1,
          paddingTop: insets.top,      // Respeta el notch/barra de estado
          paddingBottom: insets.bottom, // Respeta la barra de navegación
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
        style
      ]}
    >
      {children}
    </View>
  );
};