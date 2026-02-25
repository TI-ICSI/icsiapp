import { AppUser, UserRole } from '@/core/types/global.types';

export type CreateUserDTO = Omit<AppUser, 'uid' | 'createdAt' | 'updatedAt'> & {
  password: string;
};

export type UpdateUserDTO = Partial<Omit<AppUser, 'uid' | 'createdAt'>>;

export interface UserFilters {
  role?: UserRole;
  active?: boolean;
  assignedProject?: string;
  search?: string;
}

export interface CreateUserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  lastName: string;
  phone: string;
  role: UserRole;
  assignedProjects: string[];
}

export interface ProjectOption {
  id: string;
  name: string;
  code: string;
}

export interface CreateUserResult {
  success: boolean;
  uid?: string;
  error?: string;
}