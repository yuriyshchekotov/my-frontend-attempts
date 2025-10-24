import { Request, Response } from 'express';
import { ApiClient } from '../services/apiClient';
import { NunjucksEngine } from '../utils/nunjucksEngine';
import * as path from 'path';

/**
 * Маршруты для личного блога пользователя
 */
export class MyBlogRoutes {
  private apiClient: ApiClient;
  private templateEngine: NunjucksEngine;

  constructor(apiUrl: string) {
    this.apiClient = new ApiClient(apiUrl);
    this.templateEngine = new NunjucksEngine(path.join(process.cwd(), 'src', 'public'));
  }

  /**
   * GET /my-blog - показать личный блог пользователя
   */
  showMyBlog = async (req: Request, res: Response): Promise<void> => {
    try {
      // Проверяем авторизацию
      if (!req.user) {
        res.redirect('/login');
        return;
      }

      // Получаем токен из сессии для API запросов
      const token = req.session?.authToken;
      if (!token) {
        res.redirect('/login?error=Сессия истекла, войдите заново');
        return;
      }

      // Устанавливаем токен для API клиента
      this.apiClient.setAuthToken(token);

      // Получаем статьи пользователя
      const articles = await this.apiClient.getAllArticles();
      
      // Получаем записи прогресса пользователя
      const progressNotes = await this.apiClient.getAllProgress();

      const html = await this.templateEngine.renderTemplate('my-blog.html', {
        title: 'Мой блог',
        user: req.user,
        articles: articles || [],
        progressNotes: progressNotes || [],
        error: req.query.error as string || null,
        success: req.query.success as string || null,
      });

      res.send(html);
    } catch (error) {
      console.error('Error rendering my-blog page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  /**
   * GET / - главная страница (показывает index.html с проверкой авторизации на клиенте)
   */
  showHome = async (req: Request, res: Response): Promise<void> => {
    try {
      const html = await this.templateEngine.renderTemplate('index.html', {
        title: 'Training Blog',
        success: req.query.success as string || null,
        error: req.query.error as string || null,
      });

      res.send(html);
    } catch (error) {
      console.error('Error rendering home page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  /**
   * POST /articles - создать новую статью
   */
  createArticle = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.redirect('/login');
        return;
      }

      // Получаем токен из сессии для API запросов
      const token = req.session?.authToken;
      if (!token) {
        res.redirect('/login?error=Сессия истекла, войдите заново');
        return;
      }

      // Устанавливаем токен для API клиента
      console.log('Setting auth token:', token);
      this.apiClient.setAuthToken(token);

      console.log('Content-Type:', req.headers['content-type']);
      console.log('Body fields:', Object.keys(req.body));
      console.log('Files:', req.files ? Object.keys(req.files) : 'No files');
      
      const { title, text } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const screenshotFile = files?.screenshot?.[0];
      const sourceFile = files?.source?.[0];

      if (!title) {
        res.redirect('/my-blog?error=Название статьи обязательно');
        return;
      }

      // Создаем FormData для отправки в API
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('title', title);
      if (text) formData.append('text', text);
      if (screenshotFile) {
        formData.append('screenshot', screenshotFile.buffer, {
          filename: screenshotFile.originalname,
          contentType: screenshotFile.mimetype
        });
      }
      if (sourceFile) {
        console.log('Frontend: Source file details:', {
          originalname: sourceFile.originalname,
          mimetype: sourceFile.mimetype,
          size: sourceFile.size,
          path: sourceFile.path,
          buffer: sourceFile.buffer ? `Buffer with ${sourceFile.buffer.length} bytes` : 'undefined'
        });
        
        // Читаем файл с диска, если buffer не доступен
        if (!sourceFile.buffer && sourceFile.path) {
          try {
            const fs = require('fs');
            const fileBuffer = fs.readFileSync(sourceFile.path);
            console.log('Frontend: Read file from disk, size:', fileBuffer.length);
            formData.append('source', fileBuffer, {
              filename: sourceFile.originalname,
              contentType: sourceFile.mimetype
            });
          } catch (error) {
            console.error('Frontend: Error reading file from disk:', error);
            formData.append('source', sourceFile.buffer, {
              filename: sourceFile.originalname,
              contentType: sourceFile.mimetype
            });
          }
        } else {
          formData.append('source', sourceFile.buffer, {
            filename: sourceFile.originalname,
            contentType: sourceFile.mimetype
          });
        }
      }

      await this.apiClient.createArticleWithFiles(formData);

      res.redirect('/my-blog?success=Статья создана успешно');
    } catch (error) {
      console.error('Error creating article:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка создания статьи';
      res.redirect(`/my-blog?error=${encodeURIComponent(errorMessage)}`);
    }
  };

  /**
   * POST /progress-notes - создать новую запись прогресса
   */
  createProgressNote = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.redirect('/login');
        return;
      }

      // Получаем токен из сессии для API запросов
      const token = req.session?.authToken;
      if (!token) {
        res.redirect('/login?error=Сессия истекла, войдите заново');
        return;
      }

      // Устанавливаем токен для API клиента
      this.apiClient.setAuthToken(token);

      const { day, topic, sessionType, practice, confidence, repeat, comment } = req.body;

      if (!day || !topic || !sessionType || !practice) {
        res.redirect('/my-blog?error=Заполните все обязательные поля');
        return;
      }

      const progressData = {
        day,
        topic,
        sessionType: sessionType as 'чтение' | 'кодинг' | 'мини-проект' | 'повторение',
        practice,
        confidence: parseInt(confidence) || 1,
        repeat: repeat === 'on',
        comment: comment || null,
      };

      await this.apiClient.createProgress(progressData);

      res.redirect('/my-blog?success=Запись прогресса создана успешно');
    } catch (error) {
      console.error('Error creating progress note:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка создания записи прогресса';
      res.redirect(`/my-blog?error=${encodeURIComponent(errorMessage)}`);
    }
  };
}
