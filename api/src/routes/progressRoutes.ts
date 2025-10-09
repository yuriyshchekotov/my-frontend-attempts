import { Router } from 'express';
import { ProgressController } from '../controllers/progressController';
import { StorageClient } from '../services/storageClient';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { RolesMiddleware } from '../middleware/roles.middleware';

/**
 * Роуты для работы с записями прогресса
 */
export function createProgressRoutes(storageClient: StorageClient): Router {
  const router = Router();
  const progressController = new ProgressController(storageClient);
  const authMiddleware = new AuthMiddleware();
  const rolesMiddleware = new RolesMiddleware();

  /**
   * @route GET /progress-notes
   * @desc Получить все записи прогресса (требует авторизации)
   */
  router.get('/', 
    authMiddleware.authenticate,
    progressController.getAllProgress.bind(progressController)
  );

  /**
   * @route GET /progress-notes/:id
   * @desc Получить запись прогресса по ID (требует авторизации)
   */
  router.get('/:id', 
    authMiddleware.authenticate,
    progressController.getProgressById.bind(progressController)
  );

  /**
   * @route POST /progress-notes
   * @desc Создать новую запись прогресса (требует авторизации)
   */
  router.post('/', 
    authMiddleware.authenticate,
    progressController.createProgress.bind(progressController)
  );

  /**
   * @route PUT /progress-notes/:id
   * @desc Обновить запись прогресса (требует авторизации)
   */
  router.put('/:id', 
    authMiddleware.authenticate,
    progressController.updateProgress.bind(progressController)
  );

  /**
   * @route DELETE /progress-notes/:id
   * @desc Удалить запись прогресса (требует авторизации)
   */
  router.delete('/:id', 
    authMiddleware.authenticate,
    progressController.deleteProgress.bind(progressController)
  );

  return router;
}

