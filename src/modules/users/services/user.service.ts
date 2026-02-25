import { 
  getAuth, createUserWithEmailAndPassword, signOut
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { auth, db, firebaseConfig } from '@/core/config/firebase.config';
import { CreateUserFormData, CreateUserResult, ProjectOption } from '../types/user.types';
import { AppUser } from '@/core/types/global.types';
import { initializeApp, deleteApp, getApp, getApps } from 'firebase/app'

class UserService {
  // Crear nuevo usuario
  async createUser(
    data: CreateUserFormData, 
    createdBy: string
  ): Promise<CreateUserResult> {
    
    // Nombre único para la instancia temporal
    const tempAppName = `temp-app-${Date.now()}`;
    let tempApp;

    try {
      // 1. Crear una app de Firebase temporal
      tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);

      // 2. Crear el usuario en la app temporal
      // Esto NO afectará la sesión de la app principal
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth,
        data.email,
        data.password
      );

      const uid = userCredential.user.uid;

      // 3. Guardar datos en Firestore usando la instancia de DB principal (que sí tiene permisos)
      const userData: Omit<AppUser, 'uid'> = {
        email: data.email,
        name: data.name,
        lastName: data.lastName,
        phone: data.phone || '',
        role: data.role,
        assignedProjects: data.assignedProjects,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: createdBy,
      };

      await setDoc(doc(db, 'users', uid), userData);

      // 4. Crear perfil público
      await setDoc(doc(db, 'profiles', uid), {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        createdAt: serverTimestamp(),
      });

      // 5. Cerrar sesión en la app temporal y destruirla
      await signOut(tempAuth);
      
      return { success: true, uid };

    } catch (error: any) {
      console.error('Error creating user:', error);
      return { 
        success: false, 
        error: error.message || 'Error al crear el usuario' 
      };
    } finally {
      // Limpieza: Siempre eliminar la app temporal para liberar memoria
      if (tempApp) {
        await deleteApp(tempApp);
      }
    }

    /*try {
      // 1. Validar que el email no exista ya en Firestore
      const existingUser = await this.findUserByEmail(data.email);
      if (existingUser) {
        return { 
          success: false, 
          error: 'Ya existe un usuario con este correo electrónico' 
        };
      }

      // 2. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // 3. Preparar datos del usuario para Firestore
      const userData: Omit<AppUser, 'uid'> = {
        email: data.email,
        name: data.name,
        lastName: data.lastName,
        phone: data.phone || '',
        role: data.role,
        assignedProjects: data.assignedProjects,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: createdBy,
      };

      // 4. Guardar en Firestore (colección 'users')
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);

      // 5. Crear perfil público para búsquedas rápidas
      await setDoc(doc(db, 'profiles', userCredential.user.uid), {
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        photoURL: null,
        createdAt: serverTimestamp(),
      });

      return { 
        success: true, 
        uid: userCredential.user.uid 
      };

    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Manejar errores específicos de Firebase
      if (error.code === 'auth/email-already-in-use') {
        return { 
          success: false, 
          error: 'El correo electrónico ya está registrado' 
        };
      }
      
      return { 
        success: false, 
        error: error.message || 'Error al crear el usuario' 
      };
    }*/
  }

  // Buscar usuario por email
  async findUserByEmail(email: string): Promise<boolean> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email));
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error finding user:', error);
      return false;
    }
  }

  async getEngineersByProject(projectId: string): Promise<AppUser[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where('role', '==', 'engineer'),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(q);
      const engineers: AppUser[] = [];
      
      snapshot.forEach(doc => {
        const userData = doc.data() as Omit<AppUser, 'uid'>;
        // Filtrar por proyecto asignado
        if (userData.assignedProjects?.includes(projectId)) {
          engineers.push({
            uid: doc.id,
            ...userData
          } as AppUser);
        }
      });
      
      return engineers;
    } catch (error) {
      console.error('Error getting engineers by project:', error);
      return [];
    }
  }

  // Obtener usuario por ID
  async getUserById(uid: string): Promise<AppUser | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return {
          uid: userDoc.id,
          ...userDoc.data()
        } as AppUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  // Obtener proyectos disponibles
  async getAvailableProjects(): Promise<ProjectOption[]> {
    // TODO: Obtener de Firestore cuando tengas la colección de proyectos
    return [
      { id: 'toshiba', name: 'Toshiba', code: 'TOS' },
      { id: 'similares', name: 'Similares', code: 'SIM' },
    ];
  }
}

export const userService = new UserService();