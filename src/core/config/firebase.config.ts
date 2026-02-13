import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, Auth, getAuth  } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage  } from 'firebase/storage';
import { getFunctions, Functions } from 'firebase/functions';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'


const firebaseConfig = {
  apiKey:  process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID as string
};

console.log("API KEY DIRECTA:", process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
console.log("✅ API KEY DIRECTA:", process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
console.log("✅ Configuración completa:", {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? 'Definida' : 'No definida',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'Definida' : 'No definida',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? 'Definida' : 'No definida',
});

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage ;
let functions: Functions;



if (!getApps().length) {
  app = initializeApp(firebaseConfig);

  // ✅ Auth (Firebase 12 detecta RN automáticamente)
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });

  // ✅ Firestore
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  });

  storage = getStorage(app);
  functions = getFunctions(app, 'us-central1');

} else {
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'us-central1');
}

export { app, auth, db, storage, functions };
