import { Request, Response } from 'express';
import { ApiClient } from '../services/apiClient';
import { NunjucksEngine } from '../utils/nunjucksEngine';
import { AuthGuard } from '../utils/authGuard';
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

      const { title, text, screenshot, source } = req.body;

      if (!title) {
        res.redirect('/my-blog?error=Название статьи обязательно');
        return;
      }

      const articleData = {
        title,
        text: text || undefined,
        screenshot: screenshot || undefined,
        source: source || undefined,
      };

      await this.apiClient.createArticle(articleData);

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
