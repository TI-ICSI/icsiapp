import * as dotenv from 'dotenv';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: resolve(__dirname, '../.env') });

// Verificar variables
if (!process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 
    !process.env.FIREBASE_CLIENT_EMAIL || 
    !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('❌ Faltan variables de entorno requeridas');
  process.exit(1);
}

async function createAdminUser() {
  try {
    console.log('🚀 Inicializando Firebase Admin...');
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    // Inicializar Firebase Admin
    const app = initializeApp({
      credential: cert({
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey
      }),
    });

    const auth = getAuth(app);
    const db = getFirestore(app);

    // Datos del admin (según la estructura que mostraste)
    const adminEmail = 'coordinador@test.com';
    const adminPassword = '123456'; // Mínimo 6 caracteres, mayúscula y número
    const adminName = 'coordi';
    const adminLastName = 'Temporal';

    // 1. Verificar si ya existe en Authentication
    let userUid;
    try {
      const existingUser = await auth.getUserByEmail(adminEmail);
      console.log('⚠️ Usuario ya existe en Authentication con UID:', existingUser.uid);
      userUid = existingUser.uid;
      
      // Actualizar claims
      await auth.setCustomUserClaims(existingUser.uid, { role: 'coordinator' });
      console.log('✅ Claims de admin actualizados');
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Crear nuevo usuario en Authentication
        const user = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: `${adminName} ${adminLastName}`,
          emailVerified: true,
        });
        
        await auth.setCustomUserClaims(user.uid, { role: 'coordinator' });
        console.log('✅ Usuario creado en Authentication con UID:', user.uid);
        userUid = user.uid;
      } else {
        throw error;
      }
    }

    // 2. Crear/Actualizar documento en Firestore (colección 'users')
    const userDocRef = db.collection('users').doc(userUid);
    const userDoc = await userDocRef.get();

    const userData = {
      email: adminEmail,
      name: adminName,
      lastName: adminLastName,
      role: 'coordinator',
      assignedProjects: ['toshiba', 'similares'],
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };

    if (userDoc.exists) {
      // Actualizar sin sobrescribir createdAt
      await userDocRef.update({
        ...userData,
        createdAt: userDoc.data()?.createdAt || new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Documento en Firestore actualizado');
    } else {
      // Crear nuevo documento
      await userDocRef.set(userData);
      console.log('✅ Documento en Firestore creado');
    }

    // 3. Verificar el resultado
    const createdDoc = await userDocRef.get();
    
    console.log('\n🎉 ADMIN CREADO EXITOSAMENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🆔 UID:', userUid);
    console.log('👤 Nombre:', adminName, adminLastName);
    console.log('👑 Rol:', 'coordinator');
    console.log('📁 Proyectos:', 'toshiba');
    console.log('📊 Estado:', 'activo');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Datos guardados en Firestore:');
    console.log(JSON.stringify(createdDoc.data(), null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

createAdminUser();