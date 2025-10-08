import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import { StorageClient } from './services/storageClient';
import { createArticlesRouter } from './routes/articles';
import { createProgressRoutes } from './routes/progressRoutes';
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * Загружает переменные окружения из .env
 */
dotenv.config();

/** Express-приложение API сервиса. */
const app = express();
/** Порт, на котором запускается API. */
const PORT = process.env.API_PORT || 3001;
/** Базовый URL сервиса хранилища. */
const STORAGE_URL = process.env.STORAGE_URL || 'http://localhost:3002';

/**
 * Клиент для взаимодействия с сервисом хранилища.
 */
const storageClient = new StorageClient(STORAGE_URL);

/**
 * Ограничение частоты запросов (rate limiting): 100 запросов за 15 минут с IP.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  limit: 100, // максимум 100 запросов с одного IP
  message: 'Too many requests from this IP, please try again later.',
});

// Базовые middleware безопасности и производительности
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Подключение Swagger документации, если доступен openapi.yml в корне.
 */
try {
  const swaggerDocument = YAML.load(path.join(process.cwd(), 'openapi.yml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn('Swagger documentation not available:', error);
}

/**
 * Проверка здоровья сервиса и зависимостей.
 * GET /health
 */
app.get('/health', async (req, res) => {
  try {
    const storageHealthy = await storageClient.healthCheck();
    
    res.json({
      status: 'ok',
      services: {
        storage: {
          healthy: storageHealthy,
          url: STORAGE_URL,
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

// API маршруты
// Маршруты авторизации (не требуют аутентификации)
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);

// Маршруты для работы с данными (требуют аутентификации)
app.use('/articles', createArticlesRouter(storageClient));
app.use('/progress-notes', createProgressRoutes(storageClient));

// Глобальные обработчики ошибок и 404
app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Запуск HTTP-сервера API.
 */
app.listen(PORT, () => {
  console.log(`🚀 API Service running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Storage Service: ${STORAGE_URL}`);
});

export default app;
