export type UserRole = 'admin' | 'coordinator' | 'engineer';

export interface AppUser {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  lastName: string;
  phone?: string;
  assignedProjects: string[]; // IDs de proyectos (similar, toshiba)
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  photoURL?: string;
}

export interface AuthState {
  user: AppUser | null;
  isLoading: boolean;
  initialized: boolean;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  active: boolean;
  createdAt: Date;
}