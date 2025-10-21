import { Request, Response } from 'express';
import { StorageClient } from '../services/storageClient';
import { validateNewArticle, validateUpdateArticle, validateId } from '@frontend-learning/shared';

/**
 * Контроллер для работы со статьями.
 * Инкапсулирует логику валидации входных данных и взаимодействия с Storage Service.
 */
export class ArticleController {
  private storageClient: StorageClient;

  /**
   * @param storageClient Клиент для работы с сервисом хранения данных
   */
  constructor(storageClient: StorageClient) {
    this.storageClient = storageClient;
  }

  /**
   * Получить все статьи.
   * @route GET /articles
   */
  async getAllArticles(req: Request, res: Response): Promise<void> {
      try {
          let userId: number | undefined;

          if (req.query.user_id) {
              userId = parseInt(req.query.user_id as string);
          } else if (req.user && req.user.role !== 'admin') {
              userId = req.user.sub;
          }

          const articles = await this.storageClient.getAllArticles();

          // Добавляем фильтрацию, если userId указан
          const filteredArticles = userId
              ? articles.filter((a: any) => a.user_id === userId)
              : articles;

          res.json(filteredArticles);
      } catch (error) {
          console.error('Error getting articles:', error);
          res.status(500).json({
              error: 'Failed to fetch articles',
              details: error instanceof Error ? error.message : 'Unknown error'
          });
      }
  }

  /**
   * Получить статью по ID.
   * @route GET /articles/:id
   */
  async getArticleById(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(parseInt(req.params.id));
      const article = await this.storageClient.getArticleById(id);
      
      if (article) {
        res.json(article);
      } else {
        res.status(404).json({ error: 'Article not found' });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ error: 'Invalid article ID' });
        return;
      }
      
      console.error('Error getting article by id:', error);
      res.status(500).json({ 
        error: 'Failed to fetch article',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Создать новую статью.
   * @route POST /articles
   */
  async createArticle(req: Request, res: Response): Promise<void> {
    try {
        console.log(req.body);
      const articleData = validateNewArticle(req.body);
      
      // Добавляем user_id из авторизованного пользователя
      if (req.user) {
        articleData.user_id = req.user.sub;
      }
      
      const article = await this.storageClient.createArticle(articleData);
      
      res.status(201).json(article);
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ 
          error: 'Invalid article data',
          details: error.message
        });
        return;
      }
      
      console.error('Error creating article:', error);
      res.status(500).json({ 
        error: 'Failed to create article',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Обновить существующую статью.
   * @route PUT /articles/:id
   */
  async updateArticle(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(parseInt(req.params.id));
      const updateData = validateUpdateArticle(req.body);
      
      // Проверяем, что статья существует и принадлежит пользователю
      const existingArticle = await this.storageClient.getArticleById(id);
      if (!existingArticle) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      
      // Проверяем права доступа
      if (req.user && req.user.role !== 'admin' && existingArticle.user_id !== req.user.sub) {
        res.status(403).json({ error: 'Access denied. You can only update your own articles.' });
        return;
      }
      
      const article = await this.storageClient.updateArticle(id, updateData);
      
      if (article) {
        res.json(article);
      } else {
        res.status(404).json({ error: 'Article not found' });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ 
          error: 'Invalid article data or ID',
          details: error.message
        });
        return;
      }
      
      console.error('Error updating article:', error);
      res.status(500).json({ 
        error: 'Failed to update article',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Удалить статью по идентификатору.
   * @route DELETE /articles/:id
   */
  async deleteArticle(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(parseInt(req.params.id));
      
      // Проверяем, что статья существует и принадлежит пользователю
      const existingArticle = await this.storageClient.getArticleById(id);
      if (!existingArticle) {
        res.status(404).json({ error: 'Article not found' });
        return;
      }
      
      // Проверяем права доступа
      if (req.user && req.user.role !== 'admin' && existingArticle.user_id !== req.user.sub) {
        res.status(403).json({ error: 'Access denied. You can only delete your own articles.' });
        return;
      }
      
      const success = await this.storageClient.deleteArticle(id);
      
      if (success) {
        res.json({ success: true, id });
      } else {
        res.status(404).json({ error: 'Article not found' });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ error: 'Invalid article ID' });
        return;
      }
      
      console.error('Error deleting article:', error);
      res.status(500).json({ 
        error: 'Failed to delete article',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
