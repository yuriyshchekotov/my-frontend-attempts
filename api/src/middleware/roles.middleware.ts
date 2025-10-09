import { Request, Response, NextFunction } from 'express';
import { AuthTokenPayload } from '@frontend-learning/shared';

export class RolesMiddleware {
  /**
   * Middleware для проверки авторизации (пользователь должен быть авторизован)
   */
  requireAuth = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }
    next();
  };

  /**
   * Middleware для проверки роли пользователя
   */
  requireRole = (role: 'student' | 'admin') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      if (req.user.role !== role) {
        res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${role}`
        });
        return;
      }

      next();
    };
  };

  /**
   * Middleware для проверки, что пользователь является админом
   */
  requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
      return;
    }

    next();
  };

  /**
   * Middleware для проверки владения ресурсом
   * Проверяет, что user_id в параметрах запроса соответствует текущему пользователю
   * или пользователь является админом
   */
  ownershipGuard = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Админ может обращаться к любым ресурсам
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Проверяем user_id в параметрах запроса
    const requestedUserId = req.params.user_id || req.query.user_id;
    if (requestedUserId && parseInt(requestedUserId as string) !== req.user.sub) {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources'
      });
      return;
    }

    next();
  };

  /**
   * Middleware для проверки, что пользователь может управлять указанным пользователем
   */
  userManagementGuard = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    const targetUserId = parseInt(req.params.id);
    
    // Админ может управлять всеми пользователями
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // Пользователь может управлять только собой
    if (req.user.sub === targetUserId) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: 'Access denied. You can only manage your own account'
    });
  };
}


