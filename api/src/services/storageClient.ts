import axios, { AxiosInstance } from 'axios';
import { Article, NewArticle, UpdateArticle, ArticleListResponse, ArticleCreateResponse, ProgressNote, NewProgressNote, UpdateProgressNote, User, NewUser, UpdateUser } from '@frontend-learning/shared';

/**
 * HTTP клиент для работы с Storage Service
 */
export class StorageClient {
  private client: AxiosInstance;
  private baseURL: string;

  /**
   * @param baseURL Базовый URL сервиса хранилища (например, http://localhost:3002)
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
   * Получить все статьи
   * @returns Массив статей
   */
  async getAllArticles(): Promise<Article[]> {
    try {
      const response = await this.client.get('/articles');
      return response.data;
    } catch (error) {
      console.error('Failed to get articles:', error);
      throw new Error('Failed to fetch articles from storage service');
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
      console.error('Failed to get article by id:', error);
      throw new Error('Failed to fetch article from storage service');
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
      console.error('Failed to create article:', error);
      throw new Error('Failed to create article in storage service');
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
      console.error('Failed to update article:', error);
      throw new Error('Failed to update article in storage service');
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
      console.error('Failed to delete article:', error);
      throw new Error('Failed to delete article from storage service');
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
      console.error('Failed to get progress notes:', error);
      throw new Error('Failed to fetch progress notes from storage service');
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
      console.error('Failed to get progress note by id:', error);
      throw new Error('Failed to fetch progress note from storage service');
    }
  }

  /**
   * Создать новую запись прогресса
   * @param progressNote Данные новой записи прогресса
   * @returns Созданная запись прогресса
   */
  async addProgress(progressNote: NewProgressNote): Promise<ProgressNote> {
    try {
      const response = await this.client.post('/progress-notes', progressNote);
      return response.data;
    } catch (error) {
      console.error('Failed to create progress note:', error);
      throw new Error('Failed to create progress note in storage service');
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
      console.error('Failed to update progress note:', error);
      throw new Error('Failed to update progress note in storage service');
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
      console.error('Failed to delete progress note:', error);
      throw new Error('Failed to delete progress note from storage service');
    }
  }

  /**
   * Получить всех пользователей
   * @returns Массив пользователей
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await this.client.get('/users');
      return response.data;
    } catch (error) {
      console.error('Failed to get users:', error);
      throw new Error('Failed to fetch users from storage service');
    }
  }

  /**
   * Получить пользователя по ID
   * @param id Идентификатор пользователя
   * @returns Пользователь либо null, если не найден
   */
  async getUserById(id: number): Promise<User | null> {
    try {
      const response = await this.client.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Failed to get user by id:', error);
      throw new Error('Failed to fetch user from storage service');
    }
  }

  /**
   * Создать нового пользователя
   * @param user Данные нового пользователя
   * @returns Созданный пользователь
   */
  async createUser(user: NewUser): Promise<User> {
    try {
      const response = await this.client.post('/users', user);
      return response.data;
    } catch (error) {
      console.error('Failed to create user:', error);
      throw new Error('Failed to create user in storage service');
    }
  }

  /**
   * Обновить пользователя
   * @param id Идентификатор пользователя
   * @param user Частичные данные для обновления
   * @returns Обновленный пользователь или null, если не найден
   */
  async updateUser(id: number, user: UpdateUser): Promise<User | null> {
    try {
      const response = await this.client.put(`/users/${id}`, user);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Failed to update user:', error);
      throw new Error('Failed to update user in storage service');
    }
  }

  /**
   * Удалить пользователя
   * @param id Идентификатор пользователя
   * @returns true если удален, иначе false
   */
  async deleteUser(id: number): Promise<boolean> {
    try {
      const response = await this.client.delete(`/users/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw new Error('Failed to delete user from storage service');
    }
  }

  /**
   * Найти пользователя по email или имени
   * @param emailOrName Email или имя пользователя
   * @returns Пользователь либо null, если не найден
   */
  async findUserByEmailOrName(emailOrName: string): Promise<User | null> {
    try {
      const response = await this.client.post('/users/find', { emailOrName });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      console.error('Failed to find user:', error);
      throw new Error('Failed to find user in storage service');
    }
  }

  /**
   * Проверить пароль пользователя
   * @param id Идентификатор пользователя
   * @param password Пароль для проверки
   * @returns true если пароль верный, иначе false
   */
  async verifyUserPassword(id: number, password: string): Promise<boolean> {
    try {
      const response = await this.client.post(`/users/${id}/verify-password`, { password });
      return response.data.valid;
    } catch (error) {
      console.error('Failed to verify user password:', error);
      throw new Error('Failed to verify user password in storage service');
    }
  }

  /**
   * Проверить здоровье Storage Service
   * @returns true если сервис отвечает корректно
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.data.status === 'ok';
    } catch (error) {
      console.error('Storage service health check failed:', error);
      return false;
    }
  }
}

