import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { UsersService } from '../services/usersService';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { RolesMiddleware } from '../middleware/roles.middleware';
import { ValidateMiddleware } from '../middleware/validate.middleware';
import { CreateUserSchema, UpdateUserSchema, GetUsersQuerySchema } from '../schemas/users.schemas';
import { StorageClient } from '../services/storageClient';

const router = Router();
const validateMiddleware = new ValidateMiddleware();
const authMiddleware = new AuthMiddleware();
const rolesMiddleware = new RolesMiddleware();

// Инициализируем сервисы
const storageClient = new StorageClient(process.env.STORAGE_URL || 'http://localhost:3002');
const usersService = new UsersService(storageClient);
const usersController = new UsersController(usersService);

/**
 * GET /users
 * Получить список пользователей (только для админов)
 */
router.get('/',
  authMiddleware.authenticate,
  rolesMiddleware.requireAdmin,
  validateMiddleware.validateQuery(GetUsersQuerySchema),
  usersController.getUsers
);

/**
 * GET /users/:id
 * Получить пользователя по ID
 */
router.get('/:id',
  authMiddleware.authenticate,
  rolesMiddleware.userManagementGuard,
  usersController.getUserById
);

/**
 * POST /users
 * Создать нового пользователя (только для админов)
 */
router.post('/',
  authMiddleware.authenticate,
  rolesMiddleware.requireAdmin,
  validateMiddleware.validateBody(CreateUserSchema),
  usersController.createUser
);

/**
 * PATCH /users/:id
 * Обновить пользователя
 */
router.patch('/:id',
  authMiddleware.authenticate,
  rolesMiddleware.userManagementGuard,
  validateMiddleware.validateBody(UpdateUserSchema),
  usersController.updateUser
);

/**
 * DELETE /users/:id
 * Удалить пользователя
 */
router.delete('/:id',
  authMiddleware.authenticate,
  rolesMiddleware.userManagementGuard,
  usersController.deleteUser
);

export default router;
