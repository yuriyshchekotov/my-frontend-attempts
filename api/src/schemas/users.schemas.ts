import { z } from 'zod';

// Схема для создания пользователя (admin only)
export const CreateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'admin']).optional().default('student'),
});

// Схема для обновления пользователя (admin only)
export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  role: z.enum(['student', 'admin']).optional(),
});

// Схема для запроса пользователей с фильтрацией
export const GetUsersQuerySchema = z.object({
  user_id: z.string().transform(val => parseInt(val, 10)).optional(),
  role: z.enum(['student', 'admin']).optional(),
  search: z.string().optional(),
  page: z.string().transform(val => parseInt(val, 10)).optional().default('1'),
  limit: z.string().transform(val => parseInt(val, 10)).optional().default('10'),
});

// Типы для TypeScript
export type CreateUserData = z.infer<typeof CreateUserSchema>;
export type UpdateUserData = z.infer<typeof UpdateUserSchema>;
export type GetUsersQuery = z.infer<typeof GetUsersQuerySchema>;
