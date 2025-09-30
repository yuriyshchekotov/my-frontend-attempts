import { FileMetadata, FileUpload, StorageResult } from '@frontend-learning/shared';

/**
 * Интерфейс для адаптеров хранения файлов
 */
export interface IFileAdapter {
  /**
   * Загрузить файл
   */
  uploadFile(file: FileUpload): Promise<StorageResult<FileMetadata>>;

  /**
   * Получить файл по ID
   */
  getFileById(id: string): Promise<StorageResult<FileMetadata | null>>;

  /**
   * Получить файл по пути
   */
  getFileByPath(path: string): Promise<StorageResult<FileMetadata | null>>;

  /**
   * Удалить файл по ID
   */
  deleteFile(id: string): Promise<StorageResult<boolean>>;

  /**
   * Удалить файл по пути
   */
  deleteFileByPath(path: string): Promise<StorageResult<boolean>>;

  /**
   * Получить URL файла
   */
  getFileUrl(path: string): Promise<StorageResult<string>>;

  /**
   * Проверить доступность файла
   */
  isFileAccessible(path: string): Promise<StorageResult<boolean>>;

  /**
   * Инициализация адаптера
   */
  initialize(): Promise<void>;

  /**
   * Проверка здоровья адаптера
   */
  isHealthy(): Promise<boolean>;

  /**
   * Получение информации об адаптере
   */
  getAdapterInfo(): string;
}
