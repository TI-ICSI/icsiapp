import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import SignatureScreen from 'react-native-signature-canvas';
import * as FileSystem from 'expo-file-system/legacy';
import * as EncodingType  from 'expo-file-system'; // 👈 Import específico
import { useServiceExecution } from '../hooks/useServiceExecution';

interface Props {
  instanceId: string;
  serviceId: string;
  onSave: () => void;
  onCancel: () => void;
}

export const SignaturePad: React.FC<Props> = ({
  instanceId,
  serviceId,
  onSave,
  onCancel,
}) => {
  const signatureRef = useRef<any>(null); // 👈 Inicializado con null
  const [isSaving, setIsSaving] = useState(false);
  const { saveSignature } = useServiceExecution(serviceId);

  const handleSignature = async (signature: string) => {
    setIsSaving(true);
    try {
      const base64Data = signature.replace('data:image/png;base64,', '');
      
      // 👈 Aseguramos que documentDirectory no sea null (usamos ! si confiamos)
      if (!FileSystem.documentDirectory) {
        throw new Error('No se pudo acceder al directorio');
      }
      const fileUri = FileSystem.documentDirectory! + `signature_${Date.now()}.png`;

      // 👈 Usamos EncodingType importado
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: 'base64',
      });

      await saveSignature(instanceId, fileUri);
      onSave();
    } catch (error) {
      console.error('Error saving signature:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  return (
    <View style={styles.container}>
      <View style={styles.signatureContainer}>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleSignature}
          onEmpty={() => console.log('Empty')}
          descriptionText="Firma aquí"
          clearText="Limpiar"
          confirmText="Guardar"
          webStyle={`
            .m-signature-pad {
              box-shadow: none;
              border: 1px solid #e0e0e0;
              margin: 0;
            }
            .m-signature-pad--body {
              border-bottom: none;
            }
            .m-signature-pad--footer {
              display: none;
            }
          `}
        />
      </View>

      <View style={styles.buttons}>
        <Button mode="outlined" onPress={handleClear} style={styles.button} disabled={isSaving}>
          Limpiar
        </Button>
        <Button
          mode="contained"
          onPress={() => signatureRef.current?.readSignature()}
          style={styles.button}
          loading={isSaving}
          disabled={isSaving}
        >
          Guardar
        </Button>
        <Button mode="text" onPress={onCancel} style={styles.button} disabled={isSaving}>
          Cancelar
        </Button>
      </View>

      {isSaving && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 400, backgroundColor: '#fff' },
  signatureContainer: { flex: 1, marginBottom: 16 },
  buttons: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
  button: { flex: 1, marginHorizontal: 4 },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});