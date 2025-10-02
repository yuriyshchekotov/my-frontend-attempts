import { ProgressNote, NewProgressNote, UpdateProgressNote, StorageResult } from '@frontend-learning/shared';

/**
 * Интерфейс для адаптеров хранения данных прогресса
 */
export interface IProgressAdapter {
  /**
   * Получить все записи прогресса
   */
  getAllProgress(): Promise<StorageResult<ProgressNote[]>>;

  /**
   * Получить запись прогресса по ID
   */
  getProgressById(id: number): Promise<StorageResult<ProgressNote | null>>;

  /**
   * Создать новую запись прогресса
   */
  createProgress(progress: NewProgressNote): Promise<StorageResult<ProgressNote>>;

  /**
   * Обновить запись прогресса
   */
  updateProgress(id: number, progress: UpdateProgressNote): Promise<StorageResult<ProgressNote | null>>;

  /**
   * Удалить запись прогресса
   */
  deleteProgress(id: number): Promise<StorageResult<boolean>>;

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
