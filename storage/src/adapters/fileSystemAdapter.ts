import * as fs from 'fs-extra';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { FileMetadata, FileUpload, StorageResult } from '@frontend-learning/shared';
import { IFileAdapter } from '../interfaces';

/**
 * Адаптер для работы с локальной файловой системой
 */
export class FileSystemAdapter implements IFileAdapter {
  private basePath: string;
  private isInitialized = false;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async initialize(): Promise<void> {
    try {
      await fs.ensureDir(this.basePath);
      this.isInitialized = true;
    } catch (error) {
      throw new Error(`Failed to initialize FileSystem adapter: ${error}`);
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.isInitialized) return false;
      await fs.access(this.basePath);
      return true;
    } catch {
      return false;
    }
  }

  getAdapterInfo(): string {
    return `FileSystemAdapter(path: ${this.basePath})`;
  }

  async uploadFile(file: FileUpload): Promise<StorageResult<FileMetadata>> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Adapter not initialized' };
      }

      const fileId = uuidv4();
      const fileExtension = path.extname(file.filename);
      const fileName = `${fileId}${fileExtension}`;
      const filePath = path.join(this.basePath, fileName);

      await fs.writeFile(filePath, file.buffer);

      const metadata: FileMetadata = {
        id: fileId,
        filename: fileName,
        originalName: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: fileName, // Относительный путь
        url: `/data/${fileName}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return { success: true, data: metadata };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async getFileById(id: string): Promise<StorageResult<FileMetadata | null>> {
    try {
      // TODO: Реализация поиска файла по ID
      // Нужно будет хранить маппинг ID -> путь
      return { success: true, data: null };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get file by id: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async getFileByPath(filePath: string): Promise<StorageResult<FileMetadata | null>> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      
      if (!(await fs.pathExists(fullPath))) {
        return { success: true, data: null };
      }

      const stats = await fs.stat(fullPath);
      const metadata: FileMetadata = {
        id: path.basename(filePath, path.extname(filePath)),
        filename: path.basename(filePath),
        originalName: path.basename(filePath),
        mimetype: 'application/octet-stream', // TODO: Определить по расширению
        size: stats.size,
        path: filePath,
        url: `/data/${filePath}`,
        createdAt: stats.birthtime.toISOString(),
        updatedAt: stats.mtime.toISOString(),
      };

      return { success: true, data: metadata };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get file by path: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async deleteFile(id: string): Promise<StorageResult<boolean>> {
    try {
      // TODO: Реализация удаления файла по ID
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to delete file by id: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async deleteFileByPath(filePath: string): Promise<StorageResult<boolean>> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      
      if (!(await fs.pathExists(fullPath))) {
        return { success: true, data: false };
      }

      await fs.remove(fullPath);
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to delete file by path: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async getFileUrl(filePath: string): Promise<StorageResult<string>> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      
      if (!(await fs.pathExists(fullPath))) {
        return { success: false, error: 'File not found' };
      }

      return { success: true, data: `/data/${filePath}` };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get file URL: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async isFileAccessible(filePath: string): Promise<StorageResult<boolean>> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      const exists = await fs.pathExists(fullPath);
      return { success: true, data: exists };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to check file accessibility: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}
