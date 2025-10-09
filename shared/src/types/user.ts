import { z } from 'zod';

// User interface
export interface User {
  id: number;
  email?: string;
  name: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// Public user interface (without sensitive data)
export interface UserPublic {
  id: number;
  email?: string;
  name: string;
  role: 'student' | 'admin';
  createdAt: string;
  updatedAt: string;
}

// New user interface (for creation)
export interface NewUser {
  email?: string;
  name?: string;
  password: string;
  role?: 'student' | 'admin';
}

// Update user interface
export interface UpdateUser {
  email?: string;
  name?: string;
  password?: string;
  role?: 'student' | 'admin';
}

// Auth token payload
export interface AuthTokenPayload {
  sub: number; // user id
  name: string;
  role: 'student' | 'admin';
  iat?: number;
  exp?: number;
}

// Auth response
export interface AuthResponse {
  accessToken: string;
  user: UserPublic;
}

// Zod schemas for validation
export const UserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email().optional(),
  name: z.string().min(1, 'Name is required'),
  passwordHash: z.string().min(1, 'Password hash is required'),
  role: z.enum(['student', 'admin']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const UserPublicSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email().optional(),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['student', 'admin']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const NewUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1, 'Name is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'admin']).optional(),
});

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1, 'Name is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['student', 'admin']).optional(),
});

export const AuthTokenPayloadSchema = z.object({
  sub: z.number().int().positive(),
  name: z.string().min(1),
  role: z.enum(['student', 'admin']),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Auth schemas
export const RegisterSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters long'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine(data => !!data.email || !!data.name, {
  message: 'Either email or name must be provided',
  path: ['email'],
});

export const LoginSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
}).refine(data => !!data.email || !!data.name, {
  message: 'Either email or name must be provided',
  path: ['email'],
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters long'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters long'),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Validation functions
export function validateNewUser(data: any): NewUser {
  const result = NewUserSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
}

export function validateUpdateUser(data: any): UpdateUser {
  const result = UpdateUserSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
}

export function validateAuthTokenPayload(data: any): AuthTokenPayload {
  const result = AuthTokenPayloadSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.errors.map(e => e.message).join(', ')}`);
  }
  return result.data;
}

// Типы для TypeScript
export type RegisterData = z.infer<typeof RegisterSchema>;
export type LoginData = z.infer<typeof LoginSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordSchema>;

// Auth response types
export interface AuthResponse {
  accessToken: string;
  user: UserPublic;
}
