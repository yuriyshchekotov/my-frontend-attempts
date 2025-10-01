import { Router } from 'express';
import { ArticleController } from '../controllers/articleController';
import { StorageClient } from '../services/storageClient';
import { validateCreateArticle, validateUpdateArticle, validateIdParam } from '../middleware/validation';

/**
 * Создает router с CRUD-маршрутами для сущности Article.
 * @param storageClient Клиент для обращения к Storage Service
 * @returns Экземпляр Router с настроенными маршрутами
 */
export function createArticlesRouter(storageClient: StorageClient): Router {
  const router = Router();
  const articleController = new ArticleController(storageClient);

  // GET /articles - получить все статьи
  router.get('/', (req, res) => {
    articleController.getAllArticles(req, res);
  });

  // GET /articles/:id - получить статью по ID
  router.get('/:id', validateIdParam, (req, res) => {
    articleController.getArticleById(req, res);
  });

  // POST /articles - создать новую статью
  router.post('/', validateCreateArticle, (req, res) => {
    articleController.createArticle(req, res);
  });

  // PUT /articles/:id - обновить статью
  router.put('/:id', validateIdParam, validateUpdateArticle, (req, res) => {
    articleController.updateArticle(req, res);
  });

  // DELETE /articles/:id - удалить статью
  router.delete('/:id', validateIdParam, (req, res) => {
    articleController.deleteArticle(req, res);
  });

  return router;
}
