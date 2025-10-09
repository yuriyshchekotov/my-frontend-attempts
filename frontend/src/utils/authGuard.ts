import jwt from 'jsonwebtoken';
import { AuthTokenPayload } from '@frontend-learning/shared';

/**
 * Утилиты для проверки авторизации на frontend
 */
export class AuthGuard {
  private static readonly TOKEN_KEY = 'auth_token';

  /**
   * Получить токен из localStorage
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Сохранить токен в localStorage
   */
  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Удалить токен из localStorage
   */
  static removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  /**
   * Проверить, авторизован ли пользователь
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Проверяем, что токен не истек
      const decoded = jwt.decode(token) as unknown as AuthTokenPayload;
      if (!decoded || !decoded.exp) return false;
      
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp > now;
    } catch {
      return false;
    }
  }

  /**
   * Получить информацию о пользователе из токена
   */
  static getUserInfo(): AuthTokenPayload | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwt.decode(token) as unknown as AuthTokenPayload;
      if (!decoded || !decoded.exp) return null;
      
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp <= now) return null;
      
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Проверить, является ли пользователь админом
   */
  static isAdmin(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.role === 'admin';
  }

  /**
   * Проверить, является ли пользователь студентом
   */
  static isStudent(): boolean {
    const userInfo = this.getUserInfo();
    return userInfo?.role === 'student';
  }

  /**
   * Получить ID текущего пользователя
   */
  static getUserId(): number | null {
    const userInfo = this.getUserInfo();
    return userInfo?.sub || null;
  }

  /**
   * Получить имя текущего пользователя
   */
  static getUserName(): string | null {
    const userInfo = this.getUserInfo();
    return userInfo?.name || null;
  }

  /**
   * Перенаправить на страницу логина
   */
  static redirectToLogin(): void {
    if (typeof window === 'undefined') return;
    window.location.href = '/login';
  }

  /**
   * Перенаправить на главную страницу
   */
  static redirectToHome(): void {
    if (typeof window === 'undefined') return;
    window.location.href = '/';
  }

  /**
   * Middleware для проверки авторизации на сервере
   */
  static serverAuthMiddleware(req: any, res: any, next: any): void {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.decode(token) as unknown as AuthTokenPayload;
      if (!decoded || !decoded.exp) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }
      
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp <= now) {
        res.status(401).json({ error: 'Token expired' });
        return;
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }
}
