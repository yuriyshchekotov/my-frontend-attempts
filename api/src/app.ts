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
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3001;
const STORAGE_URL = process.env.STORAGE_URL || 'http://localhost:3002';

// Инициализация Storage Client
const storageClient = new StorageClient(STORAGE_URL);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: 'Too many requests from this IP, please try again later.',
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger документация
try {
  const swaggerDocument = YAML.load(path.join(process.cwd(), 'openapi.yml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (error) {
  console.warn('Swagger documentation not available:', error);
}

// Health check endpoint
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

// API routes
app.use('/articles', createArticlesRouter(storageClient));

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 API Service running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Storage Service: ${STORAGE_URL}`);
});

export default app;
