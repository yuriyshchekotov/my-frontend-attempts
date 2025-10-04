import { Request, Response } from 'express';
import { StorageClient } from '../services/storageClient';
import { validateNewProgressNote, validateUpdateProgressNote, validateId } from '@frontend-learning/shared';

/**
 * Контроллер для работы с записями прогресса.
 * Инкапсулирует логику валидации входных данных и взаимодействия с Storage Service.
 */
export class ProgressController {
  private storageClient: StorageClient;

  /**
   * @param storageClient Клиент для работы с сервисом хранения данных
   */
  constructor(storageClient: StorageClient) {
    this.storageClient = storageClient;
  }

  /**
   * Получить все записи прогресса.
   * @route GET /progress-notes
   */
  async getAllProgress(req: Request, res: Response): Promise<void> {
    try {
      const progressNotes = await this.storageClient.getAllProgress();
      res.json(progressNotes);
    } catch (error) {
      console.error('Error getting progress notes:', error);
      res.status(500).json({ 
        error: 'Failed to fetch progress notes',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Получить запись прогресса по ID.
   * @route GET /progress-notes/:id
   */
  async getProgressById(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(parseInt(req.params.id));
      const progressNote = await this.storageClient.getProgressById(id);
      
      if (progressNote) {
        res.json(progressNote);
      } else {
        res.status(404).json({ error: 'Progress note not found' });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ error: 'Invalid progress note ID' });
        return;
      }
      
      console.error('Error getting progress note by id:', error);
      res.status(500).json({ 
        error: 'Failed to fetch progress note',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Создать новую запись прогресса.
   * @route POST /progress-notes
   */
  async createProgress(req: Request, res: Response): Promise<void> {
    try {
      const progressData = validateNewProgressNote(req.body);
      const progressNote = await this.storageClient.addProgress(progressData);
      
      res.status(201).json(progressNote);
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ 
          error: 'Invalid progress note data',
          details: error.message
        });
        return;
      }
      
      console.error('Error creating progress note:', error);
      res.status(500).json({ 
        error: 'Failed to create progress note',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Обновить существующую запись прогресса.
   * @route PUT /progress-notes/:id
   */
  async updateProgress(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(parseInt(req.params.id));
      const updateData = validateUpdateProgressNote(req.body);
      
      const progressNote = await this.storageClient.updateProgress(id, updateData);
      
      if (progressNote) {
        res.json(progressNote);
      } else {
        res.status(404).json({ error: 'Progress note not found' });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ 
          error: 'Invalid progress note data or ID',
          details: error.message
        });
        return;
      }
      
      console.error('Error updating progress note:', error);
      res.status(500).json({ 
        error: 'Failed to update progress note',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Удалить запись прогресса по идентификатору.
   * @route DELETE /progress-notes/:id
   */
  async deleteProgress(req: Request, res: Response): Promise<void> {
    try {
      const id = validateId(parseInt(req.params.id));
      const success = await this.storageClient.deleteProgress(id);
      
      if (success) {
        res.json({ success: true, id });
      } else {
        res.status(404).json({ error: 'Progress note not found' });
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ error: 'Invalid progress note ID' });
        return;
      }
      
      console.error('Error deleting progress note:', error);
      res.status(500).json({ 
        error: 'Failed to delete progress note',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

