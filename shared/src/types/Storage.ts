import { Article, NewArticle, UpdateArticle } from './Article';
import { FileMetadata, FileUpload } from './File';

// Базовые интерфейсы для Storage Service
export interface IStorageAdapter {
  // Статьи
  getAllArticles(): Promise<Article[]>;
  getArticleById(id: number): Promise<Article | null>;
  createArticle(article: NewArticle): Promise<Article>;
  updateArticle(id: number, article: UpdateArticle): Promise<Article | null>;
  deleteArticle(id: number): Promise<boolean>;
  
  // Инициализация
  initialize(): Promise<void>;
  isHealthy(): Promise<boolean>;
}

export interface IFileAdapter {
  // Файлы
  uploadFile(file: FileUpload): Promise<FileMetadata>;
  getFileById(id: string): Promise<FileMetadata | null>;
  getFileByPath(path: string): Promise<FileMetadata | null>;
  deleteFile(id: string): Promise<boolean>;
  deleteFileByPath(path: string): Promise<boolean>;
  
  // URL и доступ
  getFileUrl(path: string): Promise<string>;
  isFileAccessible(path: string): Promise<boolean>;
  
  // Инициализация
  initialize(): Promise<void>;
  isHealthy(): Promise<boolean>;
}

// Конфигурация Storage Service
export interface StorageConfig {
  mode: 'local' | 'cloud';
  
  // Локальная конфигурация
  local?: {
    dbPath: string;
    filesPath: string;
  };
  
  // Облачная конфигурация
  cloud?: {
    projectId: string;
    credentialsPath?: string;
    firestoreCollection: string;
    storageBucket: string;
  };
}

// Результаты операций
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Типы для миграции
export interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: string[];
}

// Типы для мониторинга
export interface StorageHealth {
  isHealthy: boolean;
  adapter: string;
  lastCheck: string;
  errors?: string[];
}

