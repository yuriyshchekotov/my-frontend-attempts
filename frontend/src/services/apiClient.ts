import axios, { AxiosInstance } from 'axios';
import { Article, NewArticle, UpdateArticle, ProgressNote, NewProgressNote, UpdateProgressNote } from '@frontend-learning/shared';

/**
 * HTTP клиент для работы с API Service
 * ⚠️ ВАЖНО: Используется только на сервере для вызовов API
 */
export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  /**
   * @param baseURL Базовый URL API сервиса (например, http://localhost:3001)
   */
  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Установить токен авторизации для запросов
   */
  setAuthToken(token: string | null) {
    if (token) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.client.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Получить все статьи
   * @returns Массив статей
   */
  async getAllArticles(): Promise<Article[]> {
    try {
      const response = await this.client.get('/articles');
      return response.data;
    } catch (error) {
      console.error('Failed to get articles from API:', error);
      throw new Error('Failed to fetch articles from API service');
    }
  }


  /**
   * Получить статью по ID
   * @param id Идентификатор статьи
   * @returns Статья либо null, если не найдена
   */
  async getArticleById(id: number): Promise<Article | null> {
    try {
      const response = await this.client.get(`/articles/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Failed to get article by id from API:', error);
      throw new Error('Failed to fetch article from API service');
    }
  }

  /**
   * Создать новую статью
   * @param article Данные новой статьи
   * @returns Созданная статья
   */
  async createArticle(article: NewArticle): Promise<Article> {
    try {
      const response = await this.client.post('/articles', article);
      return response.data;
    } catch (error) {
      console.error('Failed to create article via API:', error);
      throw new Error('Failed to create article via API service');
    }
  }


  /**
   * Обновить статью
   * @param id Идентификатор статьи
   * @param article Частичные данные для обновления
   * @returns Обновленная статья или null, если не найдена
   */
  async updateArticle(id: number, article: UpdateArticle): Promise<Article | null> {
    try {
      const response = await this.client.put(`/articles/${id}`, article);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Failed to update article via API:', error);
      throw new Error('Failed to update article via API service');
    }
  }

  /**
   * Удалить статью
   * @param id Идентификатор статьи
   * @returns true если удалена, иначе false
   */
  async deleteArticle(id: number): Promise<boolean> {
    try {
      const response = await this.client.delete(`/articles/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to delete article via API:', error);
      throw new Error('Failed to delete article via API service');
    }
  }

  /**
   * Получить все записи прогресса
   * @returns Массив записей прогресса
   */
  async getAllProgress(): Promise<ProgressNote[]> {
    try {
      const response = await this.client.get('/progress-notes');
      return response.data;
    } catch (error) {
      console.error('Failed to get progress notes from API:', error);
      throw new Error('Failed to fetch progress notes from API service');
    }
  }


  /**
   * Получить запись прогресса по ID
   * @param id Идентификатор записи прогресса
   * @returns Запись прогресса либо null, если не найдена
   */
  async getProgressById(id: number): Promise<ProgressNote | null> {
    try {
      const response = await this.client.get(`/progress-notes/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Failed to get progress note by id from API:', error);
      throw new Error('Failed to fetch progress note from API service');
    }
  }

  /**
   * Создать новую запись прогресса
   * @param progressNote Данные новой записи прогресса
   * @returns Созданная запись прогресса
   */
  async createProgress(progressNote: NewProgressNote): Promise<ProgressNote> {
    try {
      const response = await this.client.post('/progress-notes', progressNote);
      return response.data;
    } catch (error) {
      console.error('Failed to create progress note via API:', error);
      throw new Error('Failed to create progress note via API service');
    }
  }


  /**
   * Обновить запись прогресса
   * @param id Идентификатор записи прогресса
   * @param progressNote Частичные данные для обновления
   * @returns Обновленная запись прогресса или null, если не найдена
   */
  async updateProgress(id: number, progressNote: UpdateProgressNote): Promise<ProgressNote | null> {
    try {
      const response = await this.client.put(`/progress-notes/${id}`, progressNote);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Failed to update progress note via API:', error);
      throw new Error('Failed to update progress note via API service');
    }
  }

  /**
   * Удалить запись прогресса
   * @param id Идентификатор записи прогресса
   * @returns true если удалена, иначе false
   */
  async deleteProgress(id: number): Promise<boolean> {
    try {
      const response = await this.client.delete(`/progress-notes/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to delete progress note via API:', error);
      throw new Error('Failed to delete progress note via API service');
    }
  }

  /**
   * Проверить здоровье API Service
   * @returns true если сервис отвечает корректно
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data.status === 'ok';
    } catch (error) {
      console.error('API service health check failed:', error);
      return false;
    }
  }
}
