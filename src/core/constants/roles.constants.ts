export const ROLES = {
  ADMIN: 'admin',
  COORDINATOR: 'coordinator',
  ENGINEER: 'engineer',
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

export const ROLE_NAMES: Record<RoleType, string> = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.COORDINATOR]: 'Coordinador',
  [ROLES.ENGINEER]: 'Ingeniero',
};

export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  [ROLES.ADMIN]: 'Acceso total al sistema',
  [ROLES.COORDINATOR]: 'Gestión de servicios y ingenieros',
  [ROLES.ENGINEER]: 'Ejecución de servicios asignados',
};

// Roles que cada rol puede crear
export const ALLOWED_ROLES_TO_CREATE: Record<RoleType, RoleType[]> = {
  [ROLES.ADMIN]: [ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ENGINEER],
  [ROLES.COORDINATOR]: [ROLES.ENGINEER], // Solo puede crear ingenieros
  [ROLES.ENGINEER]: [], // No puede crear usuarios
};