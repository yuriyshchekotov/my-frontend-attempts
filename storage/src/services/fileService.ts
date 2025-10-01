import { FileMetadata, FileUpload, StorageResult, StorageConfig } from '@frontend-learning/shared';
import { IFileAdapter } from '../interfaces';
import { FileSystemAdapter } from '../adapters/fileSystemAdapter';
import { CloudStorageAdapter } from '../adapters/cloudStorageAdapter';

/**
 * Основной сервис для работы с файлами
 * Выбирает адаптер в зависимости от конфигурации
 */
export class FileService {
  private adapter: IFileAdapter;
  private config: StorageConfig;

  constructor(config: StorageConfig) {
    this.config = config;
    this.adapter = this.createAdapter();
  }

  private createAdapter(): IFileAdapter {
    if (this.config.mode === 'local') {
      if (!this.config.local?.filesPath) {
        throw new Error('Local files path is required for local mode');
      }
      return new FileSystemAdapter(this.config.local.filesPath);
    } else if (this.config.mode === 'cloud') {
      if (!this.config.cloud?.projectId || !this.config.cloud?.storageBucket) {
        throw new Error('Cloud storage configuration is required for cloud mode');
      }
      return new CloudStorageAdapter(
        this.config.cloud.storageBucket,
        this.config.cloud.projectId
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

  async uploadFile(file: FileUpload): Promise<StorageResult<FileMetadata>> {
    return await this.adapter.uploadFile(file);
  }

  async getFileById(id: string): Promise<StorageResult<FileMetadata | null>> {
    return await this.adapter.getFileById(id);
  }

  async getFileByPath(path: string): Promise<StorageResult<FileMetadata | null>> {
    return await this.adapter.getFileByPath(path);
  }

  async deleteFile(id: string): Promise<StorageResult<boolean>> {
    return await this.adapter.deleteFile(id);
  }

  async deleteFileByPath(path: string): Promise<StorageResult<boolean>> {
    return await this.adapter.deleteFileByPath(path);
  }

  async getFileUrl(path: string): Promise<StorageResult<string>> {
    return await this.adapter.getFileUrl(path);
  }

  async isFileAccessible(path: string): Promise<StorageResult<boolean>> {
    return await this.adapter.isFileAccessible(path);
  }
}
