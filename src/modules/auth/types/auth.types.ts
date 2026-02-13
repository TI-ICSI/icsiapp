import { AppUser, UserRole } from '@/core/types/global.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  assignedProjects: string[];
}

export interface AuthResponse {
  user: AppUser;
  token?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Session {
  user: AppUser;
  lastActivity: Date;
  expiresAt: Date;
}