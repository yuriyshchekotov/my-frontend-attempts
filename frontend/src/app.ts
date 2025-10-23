import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import session from 'express-session';

import { ApiClient } from './services/apiClient';
import { NunjucksEngine } from './utils/nunjucksEngine';
import { createPagesRouter } from './routes/pages';
import { LoginRoutes } from './routes/login';
import { RegistrationRoutes } from './routes/registration';
import { MyBlogRoutes } from './routes/my-blog';
import { multipartMiddleware, cleanupTempFiles } from './middleware/multipart.middleware';

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
const templateEngine = new NunjucksEngine(path.join(process.cwd(), 'src', 'public'));

// Инициализация маршрутов
const loginRoutes = new LoginRoutes(API_URL);
const registrationRoutes = new RegistrationRoutes(API_URL);
const myBlogRoutes = new MyBlogRoutes(API_URL);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // В production должно быть true для HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 часа
  }
}));

// Middleware для проверки авторизации (SSR)
app.use((req, res, next) => {
  // Проверяем наличие пользователя в сессии
  if (req.session?.user && req.session?.authToken) {
    // Создаём req.user для совместимости с маршрутами
    req.user = {
      sub: req.session.user.id,
      name: req.session.user.name,
      role: req.session.user.role,
      iat: 0,  // Не используется в SSR
      exp: 0   // Не используется в SSR
    };
  } else {
    req.user = undefined;
  }
  
  next();
});

// Middleware для передачи данных пользователя в шаблоны
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});

// Статические файлы
app.use('/data', express.static(path.join(process.cwd(), '..', 'storage', 'data')));
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

// Маршруты авторизации
app.get('/login', loginRoutes.showLoginPage);
app.post('/login', loginRoutes.handleLogin);
app.post('/logout', loginRoutes.handleLogout);

app.get('/registration', registrationRoutes.showRegistrationPage);
app.post('/registration', registrationRoutes.handleRegistration);

// Маршруты личного блога
app.get('/', myBlogRoutes.showHome);
app.get('/my-blog', myBlogRoutes.showMyBlog);
app.post('/articles', multipartMiddleware, cleanupTempFiles, myBlogRoutes.createArticle);
app.post('/progress-notes', myBlogRoutes.createProgressNote);

// Старые страницы (для совместимости)
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
