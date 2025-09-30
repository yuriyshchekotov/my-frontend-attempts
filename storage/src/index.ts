import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { StorageConfig } from '@frontend-learning/shared';
import { StorageService } from './services/storageService';
import { FileService } from './services/fileService';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.STORAGE_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Конфигурация Storage Service
const storageConfig: StorageConfig = {
  mode: (process.env.STORAGE_MODE as 'local' | 'cloud') || 'local',
  local: {
    dbPath: process.env.LOCAL_DB_PATH || './data/articles.json',
    filesPath: process.env.LOCAL_FILES_PATH || './data/days',
  },
  cloud: {
    projectId: process.env.GCLOUD_PROJECT_ID,
    credentialsPath: process.env.GCLOUD_CREDENTIALS,
    firestoreCollection: process.env.FIRESTORE_COLLECTION || 'articles',
    storageBucket: process.env.GCS_BUCKET_NAME,
  },
};

// Инициализация сервисов
const storageService = new StorageService(storageConfig);
const fileService = new FileService(storageConfig);

// Инициализация при запуске
async function initializeServices() {
  try {
    await storageService.initialize();
    await fileService.initialize();
    console.log(`✅ Storage Service initialized with ${storageService.getAdapterInfo()}`);
    console.log(`✅ File Service initialized with ${fileService.getAdapterInfo()}`);
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const storageHealthy = await storageService.isHealthy();
    const fileHealthy = await fileService.isHealthy();
    
    res.json({
      status: 'ok',
      services: {
        storage: {
          healthy: storageHealthy,
          adapter: storageService.getAdapterInfo(),
        },
        files: {
          healthy: fileHealthy,
          adapter: fileService.getAdapterInfo(),
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

// Articles endpoints
app.get('/articles', async (req, res) => {
  try {
    const result = await storageService.getAllArticles();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/articles/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await storageService.getArticleById(id);
    if (result.success) {
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: 'Article not found' });
      }
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/articles', async (req, res) => {
  try {
    const result = await storageService.createArticle(req.body);
    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/articles/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await storageService.updateArticle(id, req.body);
    if (result.success) {
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: 'Article not found' });
      }
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/articles/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await storageService.deleteArticle(id);
    if (result.success) {
      res.json({ success: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Files endpoints
app.post('/files', async (req, res) => {
  try {
    // TODO: Обработка multipart/form-data для загрузки файлов
    res.status(501).json({ error: 'File upload not implemented yet' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/files/:id', async (req, res) => {
  try {
    const result = await fileService.getFileById(req.params.id);
    if (result.success) {
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Storage Service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Запуск сервера
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`🚀 Storage Service running on port ${PORT}`);
    console.log(`📊 Mode: ${storageConfig.mode}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

startServer().catch(console.error);

export { StorageService, FileService };
