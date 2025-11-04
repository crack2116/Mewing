import { z } from 'zod';

// Schema de validación para Cliente
export const clientSchema = z.object({
  ruc: z.string()
    .min(11, 'El RUC debe tener 11 dígitos')
    .max(11, 'El RUC debe tener 11 dígitos')
    .regex(/^\d+$/, 'El RUC solo debe contener números'),
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  contactName: z.string()
    .min(2, 'El nombre de contacto debe tener al menos 2 caracteres')
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres'),
  contactEmail: z.string()
    .email('Debe ser un email válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  address: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
});

// Schema de validación para Conductor
export const driverSchema = z.object({
  dni: z.string()
    .min(8, 'El DNI debe tener 8 dígitos')
    .max(8, 'El DNI debe tener 8 dígitos')
    .regex(/^\d+$/, 'El DNI solo debe contener números'),
  nombres: z.string()
    .min(2, 'Los nombres deben tener al menos 2 caracteres')
    .max(100, 'Los nombres no pueden exceder 100 caracteres'),
  apellidos: z.string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(100, 'Los apellidos no pueden exceder 100 caracteres'),
  licenseNumber: z.string()
    .min(5, 'El número de licencia debe tener al menos 5 caracteres')
    .max(20, 'El número de licencia no puede exceder 20 caracteres'),
  contactPhone: z.string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(15, 'El teléfono no puede exceder 15 caracteres')
    .regex(/^[\d\s\+\-\(\)]+$/, 'El teléfono contiene caracteres inválidos'),
});

// Schema de validación para Vehículo
export const vehicleSchema = z.object({
  licensePlate: z.string()
    .min(6, 'La placa debe tener al menos 6 caracteres')
    .max(10, 'La placa no puede exceder 10 caracteres')
    .regex(/^[A-Z0-9\s\-]+$/, 'La placa solo puede contener letras mayúsculas, números y guiones'),
  make: z.string()
    .min(2, 'La marca debe tener al menos 2 caracteres')
    .max(50, 'La marca no puede exceder 50 caracteres'),
  model: z.string()
    .min(2, 'El modelo debe tener al menos 2 caracteres')
    .max(50, 'El modelo no puede exceder 50 caracteres'),
  type: z.string()
    .min(2, 'El tipo debe tener al menos 2 caracteres')
    .max(50, 'El tipo no puede exceder 50 caracteres'),
  driverId: z.string().optional(),
});

// Schema de validación para Usuario
export const userSchema = z.object({
  dni: z.string()
    .min(8, 'El DNI debe tener 8 dígitos')
    .max(8, 'El DNI debe tener 8 dígitos')
    .regex(/^\d+$/, 'El DNI solo debe contener números'),
  nombres: z.string()
    .min(2, 'Los nombres deben tener al menos 2 caracteres')
    .max(100, 'Los nombres no pueden exceder 100 caracteres'),
  apellidoPaterno: z.string()
    .min(2, 'El apellido paterno debe tener al menos 2 caracteres')
    .max(100, 'El apellido paterno no puede exceder 100 caracteres'),
  apellidoMaterno: z.string()
    .min(2, 'El apellido materno debe tener al menos 2 caracteres')
    .max(100, 'El apellido materno no puede exceder 100 caracteres'),
  fechaNacimiento: z.date({
    required_error: 'La fecha de nacimiento es requerida',
    invalid_type_error: 'La fecha de nacimiento debe ser válida',
  }).refine((date) => {
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    return actualAge >= 18;
  }, 'El usuario debe ser mayor de 18 años'),
  direccion: z.string()
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(200, 'La dirección no puede exceder 200 caracteres'),
  email: z.string()
    .email('Debe ser un email válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número')
    .optional()
    .or(z.literal('')), // Permitir vacío si es edición
  role: z.enum(['admin', 'assistant', 'viewer'], {
    errorMap: () => ({ message: 'Debe seleccionar un rol válido' }),
  }),
});

// Schema para cambio de contraseña en perfil
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder 100 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula')
    .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
  confirmPassword: z.string().min(1, 'Debe confirmar la contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Schema para edición de perfil
export const editProfileSchema = z.object({
  displayName: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z.string()
    .email('Debe ser un email válido')
    .max(100, 'El email no puede exceder 100 caracteres'),
  phone: z.string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .max(15, 'El teléfono no puede exceder 15 caracteres')
    .regex(/^[\d\s\+\-\(\)]+$/, 'El teléfono contiene caracteres inválidos')
    .optional()
    .or(z.literal('')),
});

// Schema para servicio
export const serviceRequestSchema = z.object({
  clientId: z.string().min(1, 'Debe seleccionar un cliente'),
  pickupLocation: z.string()
    .min(5, 'La ubicación de recogida debe tener al menos 5 caracteres')
    .max(200, 'La ubicación de recogida no puede exceder 200 caracteres'),
  destination: z.string()
    .min(5, 'El destino debe tener al menos 5 caracteres')
    .max(200, 'El destino no puede exceder 200 caracteres'),
  serviceDate: z.date({
    required_error: 'La fecha de servicio es requerida',
    invalid_type_error: 'La fecha de servicio debe ser válida',
  }),
  specialRequirements: z.string().max(500, 'Los requisitos especiales no pueden exceder 500 caracteres').optional(),
});

// Tipos TypeScript inferidos de los schemas
export type ClientFormData = z.infer<typeof clientSchema>;
export type DriverFormData = z.infer<typeof driverSchema>;
export type VehicleFormData = z.infer<typeof vehicleSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type EditProfileFormData = z.infer<typeof editProfileSchema>;
export type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

