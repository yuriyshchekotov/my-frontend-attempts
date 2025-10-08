import * as fs from 'fs-extra';
import * as path from 'path';
import { ProgressNote, NewProgressNote, UpdateProgressNote, StorageResult } from '@frontend-learning/shared';
import { IStorageAdapter } from '../interfaces/IStorageAdapter';

/**
 * Адаптер для работы с JSON файлом прогресса (локальное хранение)
 */
export class JsonProgressAdapter implements IStorageAdapter {
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
      throw new Error(`Failed to initialize JSON progress adapter: ${error}`);
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
    return `JsonProgressAdapter(path: ${this.dbPath})`;
  }

  async getAllProgress(userId?: number): Promise<StorageResult<ProgressNote[]>> {
    try {
      if (!this.isInitialized) {
        return { success: false, error: 'Adapter not initialized' };
      }

      const data = await fs.readFile(this.dbPath, 'utf-8');
      let progressNotes: ProgressNote[] = JSON.parse(data);
      
      // Фильтруем по user_id если указан
      if (userId !== undefined) {
        progressNotes = progressNotes.filter(note => note.user_id === userId);
      }
      
      return { success: true, data: progressNotes };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to read progress notes: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async getProgressById(id: number): Promise<StorageResult<ProgressNote | null>> {
    try {
      const result = await this.getAllProgress();
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to get progress notes' 
        };
      }

      const progressNote = result.data?.find(p => p.id === id) || null;
      return { success: true, data: progressNote };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to get progress note by id: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async addProgress(progressNote: NewProgressNote): Promise<StorageResult<ProgressNote>> {
    try {
      const result = await this.getAllProgress();
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to get progress notes' 
        };
      }

      const progressNotes = result.data || [];
      const newId = progressNotes.length > 0 ? Math.max(...progressNotes.map(p => p.id)) + 1 : 1;
      
      const newProgressNote: ProgressNote = {
        id: newId,
        user_id: progressNote.user_id || 1, // По умолчанию user_id = 1 для совместимости
        date: progressNote.date || new Date().toISOString(),
        day: progressNote.day,
        topic: progressNote.topic,
        sessionType: progressNote.sessionType,
        practice: progressNote.practice,
        files: progressNote.files || [],
        confidence: progressNote.confidence,
        repeat: progressNote.repeat,
        comment: progressNote.comment || null,
      };

      progressNotes.push(newProgressNote);
      await fs.writeFile(this.dbPath, JSON.stringify(progressNotes, null, 2));
      
      return { success: true, data: newProgressNote };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to add progress note: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async updateProgress(id: number, updateData: UpdateProgressNote): Promise<StorageResult<ProgressNote | null>> {
    try {
      const result = await this.getAllProgress();
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to get progress notes' 
        };
      }

      const progressNotes = result.data || [];
      const index = progressNotes.findIndex(p => p.id === id);
      
      if (index === -1) {
        return { success: true, data: null };
      }

      progressNotes[index] = { ...progressNotes[index], ...updateData };
      await fs.writeFile(this.dbPath, JSON.stringify(progressNotes, null, 2));
      
      return { success: true, data: progressNotes[index] };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to update progress note: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  async deleteProgress(id: number): Promise<StorageResult<boolean>> {
    try {
      const result = await this.getAllProgress();
      if (!result.success) {
        return { 
          success: false, 
          error: result.error || 'Failed to get progress notes' 
        };
      }

      const progressNotes = result.data || [];
      const initialLength = progressNotes.length;
      const filteredProgressNotes = progressNotes.filter(p => p.id !== id);
      
      if (filteredProgressNotes.length === initialLength) {
        return { success: true, data: false };
      }

      await fs.writeFile(this.dbPath, JSON.stringify(filteredProgressNotes, null, 2));
      return { success: true, data: true };
    } catch (error) {
      return { 
        success: false, 
        error: `Failed to delete progress note: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  // Методы для совместимости с IStorageAdapter (не используются для progress)
  async getAllArticles(): Promise<StorageResult<any[]>> {
    return { success: false, error: 'Method not implemented for progress adapter' };
  }

  async getArticleById(id: number): Promise<StorageResult<any | null>> {
    return { success: false, error: 'Method not implemented for progress adapter' };
  }

  async createArticle(article: any): Promise<StorageResult<any>> {
    return { success: false, error: 'Method not implemented for progress adapter' };
  }

  async updateArticle(id: number, updateData: any): Promise<StorageResult<any | null>> {
    return { success: false, error: 'Method not implemented for progress adapter' };
  }

  async deleteArticle(id: number): Promise<StorageResult<boolean>> {
    return { success: false, error: 'Method not implemented for progress adapter' };
  }
}