import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export class ValidateMiddleware {
  /**
   * Middleware для валидации тела запроса
   */
  validateBody = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            success: false,
            error: 'Validation error',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
          return;
        }
        
        res.status(400).json({
          success: false,
          error: 'Invalid request data'
        });
      }
    };
  };

  /**
   * Middleware для валидации параметров запроса
   */
  validateParams = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.params = schema.parse(req.params);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            success: false,
            error: 'Invalid parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
          return;
        }
        
        res.status(400).json({
          success: false,
          error: 'Invalid request parameters'
        });
      }
    };
  };

  /**
   * Middleware для валидации query параметров
   */
  validateQuery = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        req.query = schema.parse(req.query);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({
            success: false,
            error: 'Invalid query parameters',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
          return;
        }
        
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters'
        });
      }
    };
  };
}


