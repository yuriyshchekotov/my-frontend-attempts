import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';
import { AuthTokenPayload } from '@frontend-learning/shared';

// Расширяем интерфейс Request для добавления user
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export class AuthMiddleware {
  private jwtService: JwtService;

  constructor() {
    this.jwtService = new JwtService();
  }

  /**
   * Middleware для проверки JWT токена
   */
  authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      const token = this.jwtService.extractTokenFromHeader(authHeader);

      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Access token required'
        });
        return;
      }

      // Проверяем, не истек ли токен
      if (this.jwtService.isTokenExpired(token)) {
        res.status(401).json({
          success: false,
          error: 'Token expired'
        });
        return;
      }

      // Верифицируем токен
      const payload = this.jwtService.verifyAccess(token);
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      });
    }
  };

  /**
   * Middleware для опциональной авторизации (не блокирует запрос)
   */
  optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const authHeader = req.headers.authorization;
      const token = this.jwtService.extractTokenFromHeader(authHeader);

      if (token && !this.jwtService.isTokenExpired(token)) {
        const payload = this.jwtService.verifyAccess(token);
        req.user = payload;
      }
      
      next();
    } catch (error) {
      // В случае ошибки просто продолжаем без user
      next();
    }
  };
}


