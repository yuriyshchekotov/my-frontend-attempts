import { Article, NewArticle, UpdateArticle, StorageResult } from '@frontend-learning/shared';

/**
 * Интерфейс для адаптеров хранения данных статей
 */
export interface IStorageAdapter {
  /**
   * Получить все статьи
   */
  getAllArticles(): Promise<StorageResult<Article[]>>;

  /**
   * Получить статью по ID
   */
  getArticleById(id: number): Promise<StorageResult<Article | null>>;

  /**
   * Создать новую статью
   */
  createArticle(article: NewArticle): Promise<StorageResult<Article>>;

  /**
   * Обновить статью
   */
  updateArticle(id: number, article: UpdateArticle): Promise<StorageResult<Article | null>>;

  /**
   * Удалить статью
   */
  deleteArticle(id: number): Promise<StorageResult<boolean>>;

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
