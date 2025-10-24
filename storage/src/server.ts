import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { StorageConfig } from '@frontend-learning/shared';
import { StorageService } from './services/storageService';
import { FileService } from './services/fileService';
import { ProgressService } from './services/progressService';
import { UsersService } from './services/usersService';
import { UsersStore } from './services/users.store';

/** Загружаем переменные окружения из .env */
dotenv.config();

/** Экземпляр Express-приложения Storage Service. */
const app = express();
/** Порт для Storage Service. */
const PORT = process.env.STORAGE_PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Статическая раздача файлов
const filesPath = process.env.LOCAL_FILES_PATH || './data/days';
app.use('/files', express.static(filesPath));

// Настройка multer для загрузки файлов
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB лимит на файл
  },
  fileFilter: (req, file, cb) => {
    // Разрешаем только определенные типы файлов
    const allowedMimes = [
      'image/png', 'image/jpeg', 'image/jpg',
      'text/html', 'application/zip', 'application/x-zip-compressed'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Неподдерживаемый тип файла: ${file.mimetype}`));
    }
  }
});

/** Конфигурация Storage Service на основе переменных окружения. */
const storageConfig: StorageConfig = {
  mode: (process.env.STORAGE_MODE as 'local' | 'cloud') || 'local',
  local: {
    path: process.env.LOCAL_DB_PATH || './data/articles.json',
  },
  cloud: {
    projectId: process.env.GCLOUD_PROJECT_ID || '',
    credentials: process.env.GCLOUD_CREDENTIALS || '',
    collection: process.env.FIRESTORE_COLLECTION || 'articles',
    bucket: process.env.GCS_BUCKET_NAME || '',
  },
};

/** Конфигурация для FileService (отдельная от StorageService) */
const fileServiceConfig = {
  mode: (process.env.STORAGE_MODE as 'local' | 'cloud') || 'local',
  local: {
    path: process.env.FILES_PATH || './data/days',
  },
  cloud: {
    projectId: process.env.GCLOUD_PROJECT_ID || '',
    credentials: process.env.GCLOUD_CREDENTIALS || '',
    collection: process.env.FIRESTORE_COLLECTION || 'articles',
    bucket: process.env.GCS_BUCKET_NAME || '',
  },
};

/** Инициализация сервисов */
const storageService = new StorageService(storageConfig);
const fileService = new FileService(fileServiceConfig);
const progressService = new ProgressService(storageConfig);

// Инициализация сервиса пользователей
const usersStore = new UsersStore('./data');
const usersService = new UsersService(usersStore);

/**
 * Инициализация сервисов при запуске приложения.
 */
async function initializeServices() {
  try {
    await storageService.initialize();
    await fileService.initialize();
    await progressService.initialize();
    await usersService.initialize();
    console.log(`✅ Storage Service initialized with ${storageService.getAdapterInfo()}`);
    console.log(`✅ File Service initialized with ${fileService.getAdapterInfo()}`);
    console.log(`✅ Progress Service initialized with ${progressService.getAdapterInfo()}`);
    console.log(`✅ Users Service initialized`);
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
    console.log('Storage Service: Getting all articles');
    const result = await storageService.getAllArticles();
    if (result.success && result.data) {
      console.log(`Storage Service: Returning ${result.data.length} articles`);
      res.json(result.data);
    } else {
      console.error('Storage Service: Failed to get articles:', result.error);
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Storage Service: Error getting articles:', error);
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
      console.error('Storage Service: Failed to create article:', result.error);
      res.status(400).json({ 
        error: 'Failed to create article',
        details: result.error,
        type: 'storage_error'
      });
    }
  } catch (error) {
    console.error('Storage Service: Error creating article:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
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

// Progress endpoints
app.get('/progress-notes', async (req, res) => {
  try {
    const result = await progressService.getAllProgress();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/progress-notes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await progressService.getProgressById(id);
    if (result.success) {
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: 'Progress note not found' });
      }
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/progress-notes', async (req, res) => {
  try {
    const result = await progressService.addProgress(req.body);
    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/progress-notes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await progressService.updateProgress(id, req.body);
    if (result.success) {
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: 'Progress note not found' });
      }
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/progress-notes/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await progressService.deleteProgress(id);
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
app.post('/files/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const { fieldName, originalName, mimetype, size } = req.body;
    
    if (!fieldName || !originalName || !mimetype || !size) {
      res.status(400).json({ error: 'Missing required file metadata' });
      return;
    }

    // Создаем объект FileUpload для FileService
    const fileUpload = {
      name: originalName,
      filename: originalName,
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      size: req.file.size
    };

    // Загружаем файл через FileService
    console.log(`Uploading file: ${originalName} (${mimetype}, ${size} bytes)`);
    const result = await fileService.uploadFile(fileUpload);
    
    if (result.success && result.data) {
      console.log(`File uploaded successfully: ${result.data.name}`);
      
      // Получаем URL файла
      console.log(`Getting URL for file: ${result.data.name}`);
      const urlResult = await fileService.getFileUrl(result.data.name);
      
      if (urlResult.success) {
        console.log(`File URL: ${urlResult.data}`);
        res.json({ 
          success: true, 
          url: urlResult.data,
          metadata: result.data
        });
      } else {
        console.error(`Failed to get file URL: ${urlResult.error}`);
        res.status(500).json({ error: 'Failed to get file URL' });
      }
    } else {
      console.error(`Failed to upload file: ${result.error}`);
      res.status(500).json({ error: result.error || 'Failed to upload file' });
    }
  } catch (error) {
    console.error('File upload error:', error);
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

// Users endpoints
app.get('/users', async (req, res) => {
  try {
    const result = await usersService.getAllUsers();
    if (result.success) {
      res.json(result.data);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await usersService.getUserById(id);
    if (result.success) {
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const result = await usersService.createUser(req.body);
    if (result.success) {
      res.status(201).json(result.data);
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await usersService.updateUser(id, req.body);
    if (result.success) {
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await usersService.deleteUser(id);
    if (result.success) {
      res.json({ success: result.data });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users/find', async (req, res) => {
  try {
    const { emailOrName } = req.body;
    if (!emailOrName) {
      res.status(400).json({ error: 'emailOrName is required' });
      return;
    }
    
    const result = await usersService.getUserByEmailOrName(emailOrName);
    if (result.success) {
      if (result.data) {
        res.json(result.data);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users/:id/verify-password', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { password } = req.body;
    
    if (!password) {
      res.status(400).json({ error: 'password is required' });
      return;
    }
    
    const userResult = await usersService.getUserById(id);
    if (!userResult.success || !userResult.data) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    const isValid = await usersService.verifyPassword(userResult.data, password);
    res.json({ valid: isValid });
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

