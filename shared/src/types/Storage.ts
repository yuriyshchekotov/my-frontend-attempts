import { Article, NewArticle, UpdateArticle } from './Article';
import { FileMetadata, FileUpload } from './File';

/**
 * Базовый интерфейс адаптера хранилища контента (локального или облачного).
 */
export interface IStorageAdapter {
  /** Возвращает все статьи. */
  getAllArticles(): Promise<Article[]>;
  /** Ищет статью по идентификатору. */
  getArticleById(id: number): Promise<Article | null>;
  /** Создает новую статью. */
  createArticle(article: NewArticle): Promise<Article>;
  /** Обновляет существующую статью по идентификатору. */
  updateArticle(id: number, article: UpdateArticle): Promise<Article | null>;
  /** Удаляет статью по идентификатору. */
  deleteArticle(id: number): Promise<boolean>;
  
  /** Выполняет инициализацию адаптера (папки, подключения, индексы). */
  initialize(): Promise<void>;
  /** Проверяет доступность и корректность работы адаптера. */
  isHealthy(): Promise<boolean>;
}

export interface IFileAdapter {
  /** Загружает файл и возвращает его метаданные. */
  uploadFile(file: FileUpload): Promise<FileMetadata>;
  /** Возвращает метаданные файла по идентификатору. */
  getFileById(id: string): Promise<FileMetadata | null>;
  /** Возвращает метаданные файла по пути в хранилище. */
  getFileByPath(path: string): Promise<FileMetadata | null>;
  /** Удаляет файл по идентификатору. */
  deleteFile(id: string): Promise<boolean>;
  /** Удаляет файл по пути в хранилище. */
  deleteFileByPath(path: string): Promise<boolean>;
  
  /** Возвращает публичный URL для доступа к файлу. */
  getFileUrl(path: string): Promise<string>;
  /** Проверяет, доступен ли файл для чтения. */
  isFileAccessible(path: string): Promise<boolean>;
  
  /** Выполняет инициализацию адаптера (создание директорий, подключения). */
  initialize(): Promise<void>;
  /** Проверяет доступность и корректность работы адаптера. */
  isHealthy(): Promise<boolean>;
}

/** Конфигурация сервиса хранилища. */
export interface StorageConfig {
  mode: 'local' | 'cloud';
  
  /** Настройки локального режима. */
  local?: {
    dbPath: string;
    filesPath: string;
  };
  
  /** Настройки облачного режима. */
  cloud?: {
    projectId: string;
    credentialsPath?: string;
    firestoreCollection: string;
    storageBucket: string;
  };
}

/** Единый тип результата операции. */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Результат миграции данных. */
export interface MigrationResult {
  success: boolean;
  migrated: number;
  errors: string[];
}

/** Состояние работоспособности хранилища. */
export interface StorageHealth {
  isHealthy: boolean;
  adapter: string;
  lastCheck: string;
  errors?: string[];
}

