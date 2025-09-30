import axios, { AxiosInstance } from 'axios';
import { Article, NewArticle, UpdateArticle, ArticleListResponse, ArticleCreateResponse } from '@frontend-learning/shared';

/**
 * HTTP клиент для работы с Storage Service
 */
export class StorageClient {
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
      console.error('Failed to get articles:', error);
      throw new Error('Failed to fetch articles from storage service');
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
      console.error('Failed to get article by id:', error);
      throw new Error('Failed to fetch article from storage service');
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
      console.error('Failed to create article:', error);
      throw new Error('Failed to create article in storage service');
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
      console.error('Failed to update article:', error);
      throw new Error('Failed to update article in storage service');
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
      console.error('Failed to delete article:', error);
      throw new Error('Failed to delete article from storage service');
    }
  }

  /**
   * Проверить здоровье Storage Service
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
