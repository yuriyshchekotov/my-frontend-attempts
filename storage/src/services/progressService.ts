import { ProgressNote, NewProgressNote, UpdateProgressNote, StorageResult, StorageConfig } from '@frontend-learning/shared';
import { IProgressAdapter } from '../interfaces/IProgressAdapter';
import { JsonProgressAdapter } from '../adapters/jsonProgressAdapter';

/**
 * Основной сервис для работы с данными прогресса.
 * Выбирает адаптер в зависимости от конфигурации (local/cloud).
 */
export class ProgressService {
  private adapter: IProgressAdapter;
  private config: StorageConfig;

  /**
   * @param config Конфигурация хранилища
   */
  constructor(config: StorageConfig) {
    this.config = config;
    this.adapter = this.createAdapter();
  }

  /**
   * Создает адаптер хранилища на основе конфигурации.
   * @returns Экземпляр адаптера (JsonProgressAdapter)
   */
  private createAdapter(): IProgressAdapter {
    if (this.config.mode === 'local') {
      if (!this.config.local?.path) {
        throw new Error('Local database path is required for local mode');
      }
      // Используем путь для progress.json
      const progressPath = this.config.local.path.replace('articles.json', 'progress.json');
      return new JsonProgressAdapter(progressPath);
    } else {
      throw new Error(`Progress service currently only supports local mode`);
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

  async getAllProgress(): Promise<StorageResult<ProgressNote[]>> {
    return await this.adapter.getAllProgress();
  }

  async getProgressById(id: number): Promise<StorageResult<ProgressNote | null>> {
    return await this.adapter.getProgressById(id);
  }

  async createProgress(progress: NewProgressNote): Promise<StorageResult<ProgressNote>> {
    return await this.adapter.createProgress(progress);
  }

  async updateProgress(id: number, progress: UpdateProgressNote): Promise<StorageResult<ProgressNote | null>> {
    return await this.adapter.updateProgress(id, progress);
  }

  async deleteProgress(id: number): Promise<StorageResult<boolean>> {
    return await this.adapter.deleteProgress(id);
  }
}
