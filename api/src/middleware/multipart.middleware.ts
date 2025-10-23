import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

/**
 * Middleware для обработки multipart/form-data
 * Настраивает multer для загрузки файлов во временную директорию
 */

// Создаем временную директорию если её нет
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Настройка multer для временного хранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Генерируем уникальное имя файла с оригинальным расширением
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// Фильтр для проверки типов файлов
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = {
    screenshot: ['image/png', 'image/jpeg', 'image/jpg'],
    source: ['text/html', 'application/zip', 'application/x-zip-compressed']
  };

  const fieldName = file.fieldname as keyof typeof allowedMimes;
  const allowedTypes = allowedMimes[fieldName] || [];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Неподдерживаемый тип файла для поля ${fieldName}. Разрешены: ${allowedTypes.join(', ')}`));
  }
};

// Настройки multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB лимит на файл
    files: 2, // Максимум 2 файла (screenshot + source)
    fields: 10, // Максимум 10 текстовых полей
  }
});

/**
 * Middleware для обработки multipart/form-data только для создания статей
 * Применяется только к POST /articles
 */
export const multipartMiddleware = upload.fields([
  { name: 'screenshot', maxCount: 1 },
  { name: 'source', maxCount: 1 }
]);

/**
 * Middleware для очистки временных файлов при ошибке
 */
export const cleanupTempFiles = (req: Request, res: any, next: any) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    // Если статус ошибки (4xx, 5xx), удаляем временные файлы
    if (res.statusCode >= 400) {
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        Object.values(files).flat().forEach(file => {
          if (fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
              console.log(`Cleaned up temp file: ${file.path}`);
            } catch (error) {
              console.error(`Failed to cleanup temp file ${file.path}:`, error);
            }
          }
        });
      }
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Утилита для удаления временных файлов
 */
export const cleanupFiles = (files: Express.Multer.File[]) => {
  files.forEach(file => {
    if (fs.existsSync(file.path)) {
      try {
        fs.unlinkSync(file.path);
        console.log(`Cleaned up temp file: ${file.path}`);
      } catch (error) {
        console.error(`Failed to cleanup temp file ${file.path}:`, error);
      }
    }
  });
};
