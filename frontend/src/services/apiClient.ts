import axios, { AxiosInstance } from 'axios';
import { Article, NewArticle, UpdateArticle } from '@frontend-learning/shared';

/**
 * HTTP клиент для работы с API Service
 */
export class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

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
   * Проверить здоровье API Service
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
