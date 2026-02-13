import React, { createContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/core/config/firebase.config';
import { AppUser } from '@/core/types/global.types';
import { authService } from '../services/auth.service';
import { profileService } from '../services/profile.service';
import { passwordService } from '../services/password.service';
import { LoginCredentials, RegisterCredentials } from '../types/auth.types';

interface AuthContextProps {
  user: AppUser | null;
  isLoading: boolean;
  initialized: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<AppUser>) => Promise<void>;
  changePassword: (current: string, newPassword: string) => Promise<void>;
  uploadProfilePhoto: (uri: string) => Promise<string>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setIsLoading(true);
        
        if (firebaseUser) {
          const appUser = await authService.getCurrentUser();
          setUser(appUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
        setInitialized(true);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { user } = await authService.login(credentials);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    try {
      const { user } = await authService.register(credentials);
      setUser(user);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await passwordService.resetPassword(email);
  };

  const updateProfile = async (data: Partial<AppUser>) => {
    if (!user) throw new Error('No hay usuario autenticado');
    await profileService.updateProfile(user.uid, data);
    setUser({ ...user, ...data, updatedAt: new Date() });
  };

  const changePassword = async (current: string, newPassword: string) => {
    await passwordService.changePassword(current, newPassword);
  };

  const uploadProfilePhoto = async (uri: string) => {
    if (!user) throw new Error('No hay usuario autenticado');
    const photoURL = await profileService.uploadProfilePhoto(user.uid, uri);
    setUser({ ...user, photoURL });
    return photoURL;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        initialized,
        login,
        logout,
        register,
        resetPassword,
        updateProfile,
        changePassword,
        uploadProfilePhoto,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};