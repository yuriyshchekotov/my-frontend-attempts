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

          console.log('Getting articles for user:', userId);
          console.log('User role:', req.user?.role);
          
          const articles = await this.storageClient.getAllArticles();
          console.log(`Total articles from storage: ${articles.length}`);

          // Добавляем фильтрацию, если userId указан
          const filteredArticles = userId
              ? articles.filter((a: any) => !a.user_id || a.user_id === userId) // Показываем статьи без user_id (публичные) или принадлежащие пользователю
              : articles;

          console.log(`Filtered articles: ${filteredArticles.length}`);
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
    const uploadedFiles: string[] = []; // Для отслеживания загруженных файлов
    
    try {
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Body fields:', Object.keys(req.body));
      console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
      console.log('User from JWT:', req.user);
      console.log('User ID from JWT:', req.user?.sub);
      console.log('Authorization header:', req.headers.authorization);
      console.log('JWT token from header:', req.headers.authorization?.substring(7));
      
      // Извлекаем текстовые поля
      const { title, text } = req.body;
      
      // Валидация обязательных полей
      if (!title) {
        res.status(400).json({ 
          error: 'Title is required',
          details: 'Article title cannot be empty'
        });
        return;
      }
      
      // Проверяем, что пользователь авторизован
      if (!req.user || !req.user.sub) {
        console.error('User not authenticated or missing user ID');
        res.status(401).json({
          error: 'Authentication required',
          details: 'User not authenticated or missing user ID'
        });
        return;
      }

      // Подготавливаем данные статьи
      const articleData: any = {
        title,
        text: text || undefined,
        user_id: req.user.sub
      };
      
      // Обрабатываем файлы если они есть
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        // Обрабатываем скриншот
        if (files.screenshot && files.screenshot.length > 0) {
          const screenshotFile = files.screenshot[0];
          console.log(`Uploading screenshot: ${screenshotFile.originalname} (${screenshotFile.size} bytes)`);
          
          console.log(`Uploading screenshot to storage service...`);
          const screenshotUrl = await this.storageClient.uploadFile(screenshotFile.path, {
            fieldName: 'screenshot',
            originalName: screenshotFile.originalname,
            mimetype: screenshotFile.mimetype,
            size: screenshotFile.size
          });
          
          articleData.screenshot = screenshotUrl;
          uploadedFiles.push(screenshotFile.path);
          console.log(`Screenshot uploaded successfully: ${screenshotUrl}`);
        }
        
        // Обрабатываем исходный код
        if (files.source && files.source.length > 0) {
          const sourceFile = files.source[0];
          console.log(`Uploading source: ${sourceFile.originalname} (${sourceFile.size} bytes)`);
          
          console.log(`Uploading source to storage service...`);
          const sourceUrl = await this.storageClient.uploadFile(sourceFile.path, {
            fieldName: 'source',
            originalName: sourceFile.originalname,
            mimetype: sourceFile.mimetype,
            size: sourceFile.size
          });
          
          articleData.source = sourceUrl;
          uploadedFiles.push(sourceFile.path);
          console.log(`Source uploaded successfully: ${sourceUrl}`);
        }
      }
      
      // Валидируем финальные данные статьи
      const validatedData = validateNewArticle(articleData);
      
      // Создаем статью
      const article = await this.storageClient.createArticle(validatedData);
      
      console.log(`Article created successfully: ID ${article.id}`);
      res.status(201).json(article);
      
    } catch (error) {
      // Очищаем загруженные файлы при ошибке
      if (uploadedFiles.length > 0) {
        console.log('Cleaning up uploaded files due to error:', uploadedFiles);
        // Здесь можно добавить логику отката загруженных файлов
        // Пока просто логируем
      }
      
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
