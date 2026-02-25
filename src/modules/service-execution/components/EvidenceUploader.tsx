import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, ActivityIndicator, IconButton, TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useServiceExecution } from '../hooks/useServiceExecution';

interface Props {
  serviceId: string;
  instanceId: string;
  subcategoryId?: string;
  stage: 'before' | 'during' | 'after';
  required: boolean;
  initialImage?: string;
  onUploadStart?: () => void;
  onUploadComplete?: () => void;
}

export const EvidenceUploader: React.FC<Props> = ({
  serviceId,
  instanceId,
  subcategoryId,
  stage,
  required,
  initialImage,
  onUploadStart,
  onUploadComplete,
}) => {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  
  const { uploadPhoto } = useServiceExecution(serviceId);

  const stageLabels = {
    before: 'Antes',
    during: 'Durante',
    after: 'Después',
  };

  const stageColors = {
    before: '#1976d2',
    during: '#ed6c02',
    after: '#2e7d32',
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      handleUpload(result.assets[0].uri);
    }
  };

  const handleUpload = async (uri: string) => {
    setIsUploading(true);
    onUploadStart?.();

    try {
      await uploadPhoto(instanceId, subcategoryId, stage, uri, comment);
      setImage(uri);
      setShowComment(false);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      onUploadComplete?.();
    }
  };

  const getStatusColor = () => {
    if (image) return '#4caf50';
    if (isUploading) return '#ff9800';
    return required ? '#f44336' : '#9e9e9e';
  };

  const getStatusText = () => {
    if (image) return 'Completado';
    if (isUploading) return 'Subiendo...';
    return required ? 'Pendiente' : 'Opcional';
  };

  return (
    <View style={[styles.container, { borderLeftColor: getStatusColor() }]}>
      <TouchableOpacity onPress={pickImage} disabled={isUploading} style={styles.content}>
        <View style={styles.header}>
          <View style={styles.stageInfo}>
            <Text style={[styles.stage, { color: stageColors[stage] }]}>
              📸 {stageLabels[stage]}
            </Text>
            <Text style={[styles.status, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
          
          {isUploading ? (
            <ActivityIndicator size="small" />
          ) : (
            <IconButton
              icon={image ? 'check-circle' : 'camera'}
              size={24}
              iconColor={image ? '#4caf50' : '#666'}
            />
          )}
        </View>

        {image && (
          <View style={styles.previewContainer}>
            <Image source={{ uri: image }} style={styles.preview} />
            <IconButton
              icon="comment"
              size={20}
              onPress={() => setShowComment(!showComment)}
              style={styles.commentButton}
            />
          </View>
        )}

        {showComment && (
          <TextInput
            mode="outlined"
            placeholder="Agregar comentario..."
            value={comment}
            onChangeText={setComment}
            style={styles.commentInput}
            multiline
            numberOfLines={2}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    borderLeftWidth: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stageInfo: {
    flex: 1,
  },
  stage: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
  },
  previewContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  preview: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 8,
  },
  commentButton: {
    margin: 0,
  },
  commentInput: {
    marginTop: 8,
    backgroundColor: '#fff',
  },
});