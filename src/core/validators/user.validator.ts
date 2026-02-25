import { z } from 'zod';
import { ROLES } from '../constants/roles.constants';

// Email regex para Zod v4
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Teléfono mexicano (10 dígitos, opcional)
const phoneRegex = /^[0-9]{10}$/;

export const createUserSchema = z.object({
  email: z.string().regex(emailRegex, 'Correo electrónico inválido'),
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string()
    .transform(val => val.replace(/\s+/g, ''))
    .refine(val => val === '' || /^[0-9]{10}$/.test(val), {
      message: 'El teléfono debe tener 10 dígitos'
    })
    .optional()
    .or(z.literal('')),
  role: z.enum([ROLES.ADMIN, ROLES.COORDINATOR, ROLES.ENGINEER]),
  assignedProjects: z.array(z.string()).min(1, 'Debe seleccionar al menos un proyecto'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;