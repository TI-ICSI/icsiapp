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