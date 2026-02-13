import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/core/config/firebase.config';
import { AppUser } from '@/core/types/global.types';
import { auth } from '@/core/config/firebase.config';

class ProfileService {
  // Obtener perfil por UID
  async getProfile(uid: string): Promise<AppUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return {
          uid,
          ...userDoc.data()
        } as AppUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  }

  // Actualizar perfil
  async updateProfile(uid: string, data: Partial<AppUser>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date()
      });

      // Actualizar también perfil público
      const profileRef = doc(db, 'profiles', uid);
      await updateDoc(profileRef, {
        name: data.name,
        lastName: data.lastName,
        photoURL: data.photoURL,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Subir foto de perfil
  async uploadProfilePhoto(uid: string, uri: string): Promise<string> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      const storageRef = ref(storage, `profiles/${uid}/avatar.jpg`);
      await uploadBytes(storageRef, blob);
      
      const downloadURL = await getDownloadURL(storageRef);
      
      // Actualizar URL en Firestore
      await this.updateProfile(uid, { photoURL: downloadURL });
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }

  // Buscar usuarios por rol o proyecto
  async searchUsers(filters: {
    role?: string;
    projectId?: string;
    active?: boolean;
  }): Promise<AppUser[]> {
    try {
      let constraints = [];
      
      if (filters.role) {
        constraints.push(where('role', '==', filters.role));
      }
      
      if (filters.active !== undefined) {
        constraints.push(where('active', '==', filters.active));
      }

      const usersRef = collection(db, 'users');
      const q = query(usersRef, ...constraints);
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AppUser[];
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }
}

export const profileService = new ProfileService();