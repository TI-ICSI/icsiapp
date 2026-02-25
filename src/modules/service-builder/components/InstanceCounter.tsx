import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, TextInput, HelperText, Card } from 'react-native-paper';

interface Props {
  value: number;
  onChange: (count: number) => void;
  categoryName: string;
}

export const InstanceCounter: React.FC<Props> = ({ value, onChange, categoryName }) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleChange = (text: string) => {
    // Solo permitir números
    const numericText = text.replace(/[^0-9]/g, '');
    setInputValue(numericText);

    const num = parseInt(numericText, 10);
    if (!isNaN(num) && num > 0) {
      onChange(num);
    } else if (numericText === '') {
      onChange(0);
    }
  };

  const isValid = parseInt(inputValue, 10) > 0;

  return (
    <Card style={styles.container} mode="outlined">
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          🔢 ¿Cuántos equipos físicos hay en "{categoryName}"?
        </Text>
        
        <TextInput
          mode="outlined"
          value={inputValue}
          onChangeText={handleChange}
          keyboardType="number-pad"
          placeholder="Ej: 3"
          style={styles.input}
          error={!isValid && inputValue !== ''}
        />
        
        {!isValid && inputValue !== '' && (
          <HelperText type="error">
            Debe ser un número mayor a 0
          </HelperText>
        )}
        
        {isValid && (
          <HelperText type="info" visible={true}>
            Se crearán {inputValue} instancias de {categoryName}
          </HelperText>
        )}
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
    marginBottom: 12,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
  },
});