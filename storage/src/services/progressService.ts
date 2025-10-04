import { ProgressNote, NewProgressNote, UpdateProgressNote, StorageResult, StorageConfig } from '@frontend-learning/shared';
import { IStorageAdapter } from '../interfaces';
import { JsonProgressAdapter } from '../adapters/jsonProgressAdapter';

/**
 * Сервис для работы с данными прогресса.
 * Выбирает адаптер в зависимости от конфигурации (local/cloud).
 */
export class ProgressService {
  private adapter: IStorageAdapter;
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
  private createAdapter(): IStorageAdapter {
    if (this.config.mode === 'local') {
      if (!this.config.local?.path) {
        throw new Error('Local database path is required for local mode');
      }
      // Используем путь для progress.json
      const progressPath = this.config.local.path.replace('articles.json', 'progress.json');
      return new JsonProgressAdapter(progressPath);
    } else {
      // Для cloud режима пока используем local адаптер
      // TODO: Создать CloudProgressAdapter когда понадобится
      const progressPath = './data/progress.json';
      return new JsonProgressAdapter(progressPath);
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
    return await (this.adapter as JsonProgressAdapter).getAllProgress();
  }

  async getProgressById(id: number): Promise<StorageResult<ProgressNote | null>> {
    return await (this.adapter as JsonProgressAdapter).getProgressById(id);
  }

  async addProgress(progressNote: NewProgressNote): Promise<StorageResult<ProgressNote>> {
    return await (this.adapter as JsonProgressAdapter).addProgress(progressNote);
  }

  async updateProgress(id: number, progressNote: UpdateProgressNote): Promise<StorageResult<ProgressNote | null>> {
    return await (this.adapter as JsonProgressAdapter).updateProgress(id, progressNote);
  }

  async deleteProgress(id: number): Promise<StorageResult<boolean>> {
    return await (this.adapter as JsonProgressAdapter).deleteProgress(id);
  }
}