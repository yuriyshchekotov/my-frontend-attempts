import { Request, Response } from 'express';
import { StorageClient } from '../services/storageClient';
import { validateNewArticle, validateUpdateArticle, validateId } from '@frontend-learning/shared';

/**
 * Контроллер для работы со статьями
 */
export class ArticleController {
  private storageClient: StorageClient;

  constructor(storageClient: StorageClient) {
    this.storageClient = storageClient;
  }

  /**
   * Получить все статьи
   */
  async getAllArticles(req: Request, res: Response): Promise<void> {
    try {
      const articles = await this.storageClient.getAllArticles();
      res.json(articles);
    } catch (error) {
      console.error('Error getting articles:', error);
      res.status(500).json({ 
        error: 'Failed to fetch articles',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Получить статью по ID
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
   * Создать новую статью
   */
  async createArticle(req: Request, res: Response): Promise<void> {
    try {
      const articleData = validateNewArticle(req.body);
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
   * Обновить статью
   */
  async updateArticle(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(parseInt(req.params.id));
      const updateData = validateUpdateArticle(req.body);
      
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
   * Удалить статью
   */
  async deleteArticle(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(parseInt(req.params.id));
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
