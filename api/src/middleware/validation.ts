import { Request, Response, NextFunction } from 'express';
import { safeValidate, NewArticleSchema, UpdateArticleSchema } from '@frontend-learning/shared';

/**
 * Middleware для валидации данных создания статьи
 */
export function validateCreateArticle(req: Request, res: Response, next: NextFunction): void {
  const validation = safeValidate(NewArticleSchema, req.body);
  
  if (!validation.success) {
    res.status(400).json({
      error: 'Validation error',
      details: validation.error,
    });
    return;
  }
  
  req.body = validation.data;
  next();
}

/**
 * Middleware для валидации данных обновления статьи
 */
export function validateUpdateArticle(req: Request, res: Response, next: NextFunction): void {
  const validation = safeValidate(UpdateArticleSchema, req.body);
  
  if (!validation.success) {
    res.status(400).json({
      error: 'Validation error',
      details: validation.error,
    });
    return;
  }
  
  req.body = validation.data;
  next();
}

/**
 * Middleware для валидации ID параметра
 */
export function validateIdParam(req: Request, res: Response, next: NextFunction): void {
  const id = parseInt(req.params.id);
  
  if (isNaN(id) || id <= 0) {
    res.status(400).json({
      error: 'Invalid ID parameter',
      details: 'ID must be a positive integer',
    });
    return;
  }
  
  req.params.id = id.toString();
  next();
}

