import { Article, NewArticle, UpdateArticle, StorageResult, StorageConfig } from '@frontend-learning/shared';
import { IStorageAdapter } from '../interfaces';
import { JsonAdapter } from '../adapters/jsonAdapter';
import { FirestoreAdapter } from '../adapters/firestoreAdapter';

/**
 * Основной сервис для работы с данными статей
 * Выбирает адаптер в зависимости от конфигурации
 */
export class StorageService {
  private adapter: IStorageAdapter;
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
    this.adapter = this.createAdapter();
  }

  private createAdapter(): IStorageAdapter {
    if (this.config.mode === 'local') {
      if (!this.config.local?.dbPath) {
        throw new Error('Local database path is required for local mode');
      }
      return new JsonAdapter(this.config.local.dbPath);
    } else if (this.config.mode === 'cloud') {
      if (!this.config.cloud?.projectId || !this.config.cloud?.firestoreCollection) {
        throw new Error('Cloud configuration is required for cloud mode');
      }
      return new FirestoreAdapter(
        this.config.cloud.projectId,
        this.config.cloud.firestoreCollection
      );
    } else {
      throw new Error(`Unsupported storage mode: ${this.config.mode}`);
    }
  }

  async initialize(): Promise<void> {
    await this.adapter.initialize();
  }

  async isHealthy(): Promise<boolean> {
    return await this.adapter.isHealthy();
  }

  getAdapterInfo(): string {
    return this.adapter.getAdapterInfo();
  }

  async getAllArticles(): Promise<StorageResult<Article[]>> {
    return await this.adapter.getAllArticles();
  }

  async getArticleById(id: number): Promise<StorageResult<Article | null>> {
    return await this.adapter.getArticleById(id);
  }

  async createArticle(article: NewArticle): Promise<StorageResult<Article>> {
    return await this.adapter.createArticle(article);
  }

  async updateArticle(id: number, article: UpdateArticle): Promise<StorageResult<Article | null>> {
    return await this.adapter.updateArticle(id, article);
  }

  async deleteArticle(id: number): Promise<StorageResult<boolean>> {
    return await this.adapter.deleteArticle(id);
  }
}

