import { Router, Request, Response } from 'express';
import { ApiClient } from '../services/apiClient';
import { NunjucksEngine } from '../utils/nunjucksEngine';

/**
 * Маршруты для страниц Frontend Service
 */
export function createPagesRouter(apiClient: ApiClient,
                                  templateEngine: NunjucksEngine,
                                  apiUrl: string): Router {
  const router = Router();

  /**
   * Главная страница - рендеринг блога
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const articles = await apiClient.getAllArticles();
        const html = await templateEngine.renderBlogPage(articles, apiUrl);
      res.send(html);
    } catch (error) {
      console.error('❌ Ошибка при рендеринге главной страницы:', error);
      res.status(500).send(`
        <html>
          <head><title>Ошибка</title></head>
          <body>
            <h1>Ошибка сервера</h1>
            <p>Не удалось загрузить страницу блога</p>
            <p>Детали: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
          </body>
        </html>
      `);
    }
  });

  /**
   * Страница создания статьи
   */
  router.get('/create', async (req: Request, res: Response) => {
    try {
      const html = await templateEngine.renderCreatePage(apiUrl);
      res.send(html);
    } catch (error) {
      console.error('Ошибка при отдаче create.html:', error);
      res.status(500).send(`
        <html>
          <head><title>Ошибка</title></head>
          <body>
            <h1>Ошибка сервера</h1>
            <p>Не удалось загрузить страницу создания статьи</p>
            <p>Детали: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
          </body>
        </html>
      `);
    }
  });

  /**
   * Страница отдельной статьи (если понадобится в будущем)
   */
  router.get('/article/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).send('Invalid article ID');
        return;
      }

      const article = await apiClient.getArticleById(id);
      if (!article) {
        res.status(404).send('Article not found');
        return;
      }

      const html = await templateEngine.renderBlogPage([article], apiUrl);
      res.send(html);
    } catch (error) {
      console.error('Ошибка при рендеринге статьи:', error);
      res.status(500).send(`
        <html>
          <head><title>Ошибка</title></head>
          <body>
            <h1>Ошибка сервера</h1>
            <p>Не удалось загрузить статью</p>
            <p>Детали: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
          </body>
        </html>
      `);
    }
  });

  /**
   * Страница записей прогресса
   */
  router.get('/progress-notes', async (req: Request, res: Response) => {
    try {
      const html = await templateEngine.renderProgressNotesPage(apiUrl);
      res.send(html);
    } catch (error) {
      console.error('Ошибка при отдаче progress-notes.html:', error);
      res.status(500).send(`
        <html>
          <head><title>Ошибка</title></head>
          <body>
            <h1>Ошибка сервера</h1>
            <p>Не удалось загрузить страницу записей прогресса</p>
            <p>Детали: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}</p>
          </body>
        </html>
      `);
    }
  });

  return router;
}

