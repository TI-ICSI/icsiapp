import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/core/config/firebase.config';
import { AppUser } from '@/core/types/global.types';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';

class AuthService {
  // Transformar Firebase User a nuestro AppUser
  private async transformFirebaseUser(firebaseUser: FirebaseUser): Promise<AppUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (userDoc.exists()) {
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          ...userDoc.data()
        } as AppUser;
      }
      return null;
    } catch (error) {
      console.error('Error transforming user:', error);
      return null;
    }
  }

  // Login
  async login({ email, password }: LoginCredentials): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const appUser = await this.transformFirebaseUser(userCredential.user);
      
      if (!appUser) {
        throw new Error('Usuario no encontrado en Firestore');
      }

      if (!appUser.active) {
        throw new Error('Usuario inactivo. Contacta al administrador');
      }

      // Actualizar último login
      await updateDoc(doc(db, 'users', appUser.uid), {
        lastLogin: new Date(),
        updatedAt: new Date()
      });

      return { user: appUser };
    } catch (error: any) {
      throw new Error(this.handleAuthError(error));
    }
  }

  // Registro (solo admin/coordinador pueden crear usuarios)
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        credentials.email, 
        credentials.password
      );

      // 2. Crear perfil en Firestore
      const newUser: Omit<AppUser, 'uid'> = {
        email: credentials.email,
        name: credentials.name,
        lastName: credentials.lastName,
        phone: credentials.phone,
        role: credentials.role,
        assignedProjects: credentials.assignedProjects,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: auth.currentUser?.uid || 'system'
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);

      // 3. Crear perfil público (para búsquedas)
      await setDoc(doc(db, 'profiles', userCredential.user.uid), {
        name: credentials.name,
        lastName: credentials.lastName,
        email: credentials.email,
        role: credentials.role,
        photoURL: null
      });

      const appUser = { uid: userCredential.user.uid, ...newUser } as AppUser;
      return { user: appUser };
    } catch (error: any) {
      throw new Error(this.handleAuthError(error));
    }
  }

  // Logout
  async logout(): Promise<void> {
    await signOut(auth);
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      throw new Error(this.handleAuthError(error));
    }
  }

  // Obtener usuario actual
  async getCurrentUser(): Promise<AppUser | null> {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;
    return this.transformFirebaseUser(firebaseUser);
  }

  // Manejo de errores de Firebase
  private handleAuthError(error: any): string {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'Correo electrónico inválido';
      case 'auth/user-disabled':
        return 'Usuario deshabilitado';
      case 'auth/user-not-found':
        return 'Usuario no encontrado';
      case 'auth/wrong-password':
        return 'Contraseña incorrecta';
      case 'auth/email-already-in-use':
        return 'El correo ya está registrado';
      case 'auth/weak-password':
        return 'La contraseña debe tener al menos 6 caracteres';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet';
      default:
        return error.message || 'Error en autenticación';
    }
  }
}

export const authService = new AuthService();