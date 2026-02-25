import * as ImageManipulator from 'expo-image-manipulator';

export const compressImage = async (uri: string): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1024 } }], // Redimensionar a máximo 1024px
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // 70% calidad
    );
    return result.uri;
  } catch (error) {
    console.error('Error compressing image:', error);
    return uri; // Si falla, devolver original
  }
};

export const generateThumbnail = async (uri: string): Promise<string> => {
  try {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 200 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return uri;
  }
};