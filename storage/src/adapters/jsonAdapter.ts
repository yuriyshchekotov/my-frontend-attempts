import * as fs from 'fs-extra';
import * as path from 'path';
import { Article, NewArticle, UpdateArticle, StorageResult } from '@frontend-learning/shared';
import { IStorageAdapter } from '../interfaces/IStorageAdapter';

/**
 * Адаптер для работы с JSON файлом (локальное хранение)
 */
export class JsonAdapter implements IStorageAdapter {
  private dbPath: string;
  private isInitialized = false;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  async initialize(): Promise<void> {
    try {
      // Создаем директорию если не существует
      await fs.ensureDir(path.dirname(this.dbPath));
      
      // Создаем файл с пустым массивом если не существует
      if (!(await fs.pathExists(this.dbPath))) {
        await fs.writeFile(this.dbPath, JSON.stringify([], null, 2));
      }
      
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize JSON adapter: ${error}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isInitialized) return false;
      await fs.access(this.dbPath);
      return true;
    } catch {
      return false;
    }
  }

  getAdapterInfo(): string {
    return `JsonAdapter(path: ${this.dbPath})`;
  }

  async getAllArticles(userId?: number): Promise<StorageResult<Article[]>> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Adapter not initialized' };
      }

      const data = await fs.readFile(this.dbPath, 'utf-8');
      let articles: Article[] = JSON.parse(data);
      
      // Фильтруем по user_id если указан
      if (userId !== undefined) {
        articles = articles.filter(article => article.user_id === userId);
      }
      
      return { success: true, data: articles };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to read articles: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async getArticleById(id: number): Promise<StorageResult<Article | null>> {
    try {
      const result = await this.getAllArticles();
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to get articles' 
        };
      }

      const article = result.data?.find(a => a.id === id) || null;
      return { success: true, data: article };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get article by id: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async createArticle(article: NewArticle): Promise<StorageResult<Article>> {
    try {
      const result = await this.getAllArticles();
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to get articles' 
        };
      }

      const articles = result.data || [];
      const newId = articles.length > 0 ? Math.max(...articles.map(a => a.id)) + 1 : 1;
      
      const newArticle: Article = {
        id: newId,
        user_id: article.user_id || 1, // По умолчанию user_id = 1 для совместимости
        date: new Date().toISOString(),
        title: article.title,
        text: article.text || null,
        screenshot: article.screenshot || null,
        source: article.source || null,
        content: null, // Будет заполнено при обработке source
      };

      articles.push(newArticle);
      await fs.writeFile(this.dbPath, JSON.stringify(articles, null, 2));
      
      return { success: true, data: newArticle };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to create article: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async updateArticle(id: number, updateData: UpdateArticle): Promise<StorageResult<Article | null>> {
    try {
      const result = await this.getAllArticles();
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to get articles' 
        };
      }

      const articles = result.data || [];
      const index = articles.findIndex(a => a.id === id);
      
      if (index === -1) {
        return { success: true, data: null };
      }

      articles[index] = { ...articles[index], ...updateData };
      await fs.writeFile(this.dbPath, JSON.stringify(articles, null, 2));
      
      return { success: true, data: articles[index] };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to update article: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async deleteArticle(id: number): Promise<StorageResult<boolean>> {
    try {
      const result = await this.getAllArticles();
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to get articles' 
        };
      }

      const articles = result.data || [];
      const initialLength = articles.length;
      const filteredArticles = articles.filter(a => a.id !== id);
      
      if (filteredArticles.length === initialLength) {
        return { success: true, data: false };
      }

      await fs.writeFile(this.dbPath, JSON.stringify(filteredArticles, null, 2));
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to delete article: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

