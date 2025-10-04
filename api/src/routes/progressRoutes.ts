import { Router } from 'express';
import { ProgressController } from '../controllers/progressController';
import { StorageClient } from '../services/storageClient';

/**
 * Роуты для работы с записями прогресса
 */
export function createProgressRoutes(storageClient: StorageClient): Router {
  const router = Router();
  const progressController = new ProgressController(storageClient);

  /**
   * @route GET /progress-notes
   * @desc Получить все записи прогресса
   */
  router.get('/', progressController.getAllProgress.bind(progressController));

  /**
   * @route GET /progress-notes/:id
   * @desc Получить запись прогресса по ID
   */
  router.get('/:id', progressController.getProgressById.bind(progressController));

  /**
   * @route POST /progress-notes
   * @desc Создать новую запись прогресса
   */
  router.post('/', progressController.createProgress.bind(progressController));

  /**
   * @route PUT /progress-notes/:id
   * @desc Обновить запись прогресса
   */
  router.put('/:id', progressController.updateProgress.bind(progressController));

  /**
   * @route DELETE /progress-notes/:id
   * @desc Удалить запись прогресса
   */
  router.delete('/:id', progressController.deleteProgress.bind(progressController));

  return router;
}

