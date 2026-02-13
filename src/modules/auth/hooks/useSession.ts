import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './useAuth';

const SESSION_KEY = '@auth_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días

export const useSession = () => {
  const { user, logout } = useAuth();
  const [isSessionValid, setIsSessionValid] = useState(true);

  // Guardar sesión cuando el usuario inicia sesión
  useEffect(() => {
    if (user) {
      const session = {
        uid: user.uid,
        timestamp: Date.now(),
        expiresAt: Date.now() + SESSION_DURATION
      };
      AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      AsyncStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  // Verificar validez de la sesión
  useEffect(() => {
    const checkSession = async () => {
      const sessionStr = await AsyncStorage.getItem(SESSION_KEY);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        if (Date.now() > session.expiresAt) {
          setIsSessionValid(false);
          await logout();
        }
      }
    };

    checkSession();
  }, []);

  return {
    isSessionValid,
    extendSession: async () => {
      if (user) {
        const session = {
          uid: user.uid,
          timestamp: Date.now(),
          expiresAt: Date.now() + SESSION_DURATION
        };
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    }
  };
};