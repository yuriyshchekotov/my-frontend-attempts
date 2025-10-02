import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import { ApiClient } from './services/apiClient';
import { TemplateEngine } from './utils/templateEngine';
import { createPagesRouter } from './routes/pages';

/** Загружаем переменные окружения из .env */
dotenv.config();

/** Экземпляр Express-приложения фронтенда. */
const app = express();
/** Порт для Frontend Service. */
const PORT = process.env.FRONTEND_PORT || 3000;
/** Базовый URL API сервиса. */
const API_URL = process.env.API_URL || 'http://localhost:3001';

// Инициализация сервисов
const apiClient = new ApiClient(API_URL);
const templateEngine = new TemplateEngine(path.join(process.cwd(), 'src', 'public'));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use('/data', express.static(path.join(process.cwd(), 'data')));
app.use(express.static(path.join(process.cwd(), 'src', 'public')));

/**
 * Проверка здоровья Frontend Service и связности с API.
 * GET /health
 */
app.get('/health', async (req, res) => {
  try {
    const apiHealthy = await apiClient.healthCheck();
    
    res.json({
      status: 'ok',
      services: {
        api: {
          healthy: apiHealthy,
          url: API_URL,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Страницы
app.use('/', createPagesRouter(apiClient, templateEngine, API_URL));

// 404 handler
app.use((req, res) => {
  res.status(404).send(`
    <html>
      <head><title>Страница не найдена</title></head>
      <body>
        <h1>404 - Страница не найдена</h1>
        <p>Запрашиваемая страница не существует</p>
        <a href="/">Вернуться на главную</a>
      </body>
    </html>
  `);
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('🔥 Frontend Service error:', err);
  res.status(500).send(`
    <html>
      <head><title>Ошибка сервера</title></head>
      <body>
        <h1>Внутренняя ошибка сервера</h1>
        <p>Произошла непредвиденная ошибка</p>
        <a href="/">Вернуться на главную</a>
      </body>
    </html>
  `);
});

/**
 * Запуск HTTP-сервера фронтенда.
 */
app.listen(PORT, () => {
  console.log(`🚀 Frontend Service running on port ${PORT}`);
  console.log(`🏠 Main page: http://localhost:${PORT}`);
  console.log(`📝 Create page: http://localhost:${PORT}/create`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 API Service: ${API_URL}`);
});

export default app;
