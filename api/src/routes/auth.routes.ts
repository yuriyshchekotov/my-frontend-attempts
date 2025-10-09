import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { UsersService } from '../services/usersService';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { ValidateMiddleware } from '../middleware/validate.middleware';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schemas';
import { StorageClient } from '../services/storageClient';

const router = Router();
const validateMiddleware = new ValidateMiddleware();
const authMiddleware = new AuthMiddleware();

// Инициализируем сервисы
const storageClient = new StorageClient(process.env.STORAGE_URL || 'http://localhost:3002');
const usersService = new UsersService(storageClient);
const authController = new AuthController(usersService);

/**
 * POST /auth/register
 * Регистрация нового пользователя
 */
router.post('/register', 
  validateMiddleware.validateBody(RegisterSchema),
  authController.register
);

/**
 * POST /auth/login
 * Вход пользователя
 */
router.post('/login',
  validateMiddleware.validateBody(LoginSchema),
  authController.login
);

/**
 * GET /auth/me
 * Получить информацию о текущем пользователе
 */
router.get('/me',
  authMiddleware.authenticate,
  authController.me
);

/**
 * POST /auth/logout
 * Выход пользователя
 */
router.post('/logout',
  authMiddleware.authenticate,
  authController.logout
);

export default router;
