import { Router } from 'express';
import { ArticleController } from '../controllers/articleController';
import { StorageClient } from '../services/storageClient';
import { validateCreateArticle, validateUpdateArticle, validateIdParam } from '../middleware/validation';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { RolesMiddleware } from '../middleware/roles.middleware';
import { multipartMiddleware, cleanupTempFiles } from '../middleware/multipart.middleware';

/**
 * Создает router с CRUD-маршрутами для сущности Article.
 * @param storageClient Клиент для обращения к Storage Service
 * @returns Экземпляр Router с настроенными маршрутами
 */
export function createArticlesRouter(storageClient: StorageClient): Router {
  const router = Router();
  const articleController = new ArticleController(storageClient);
  const authMiddleware = new AuthMiddleware();
  const rolesMiddleware = new RolesMiddleware();

  // GET /articles - получить все статьи (требует авторизации)
  router.get('/', 
    authMiddleware.authenticate,
    (req, res) => {
      articleController.getAllArticles(req, res);
    }
  );

  // GET /articles/:id - получить статью по ID (требует авторизации)
  router.get('/:id', 
    authMiddleware.authenticate,
    validateIdParam, 
    (req, res) => {
      articleController.getArticleById(req, res);
    }
  );

  // POST /articles - создать новую статью (требует авторизации)
  router.post('/', 
    authMiddleware.authenticate,
    multipartMiddleware,
    cleanupTempFiles,
    (req, res) => {
      articleController.createArticle(req, res);
    }
  );

  // PUT /articles/:id - обновить статью (требует авторизации)
  router.put('/:id', 
    authMiddleware.authenticate,
    validateIdParam, 
    validateUpdateArticle, 
    (req, res) => {
      articleController.updateArticle(req, res);
    }
  );

  // DELETE /articles/:id - удалить статью (требует авторизации)
  router.delete('/:id', 
    authMiddleware.authenticate,
    validateIdParam, 
    (req, res) => {
      articleController.deleteArticle(req, res);
    }
  );

  return router;
}
