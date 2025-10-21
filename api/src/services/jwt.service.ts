import jwt, { SignOptions } from 'jsonwebtoken';
import { AuthTokenPayload } from '@frontend-learning/shared';

export class JwtService {
  private accessSecret: string;
  private accessExpires: string;

  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET || 'dev_secret_change_me';
    this.accessExpires = process.env.JWT_ACCESS_EXPIRES || '24h';
  }

  /**
   * Генерирует access token
   */
  signAccess(payload: Omit<AuthTokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpires,
    } as SignOptions);
  }

  /**
   * Проверяет и декодирует access token
   */
  verifyAccess(token: string): AuthTokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessSecret) as unknown as AuthTokenPayload;
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  /**
   * Извлекает токен из заголовка Authorization
   */
  extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Проверяет, истек ли токен
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as unknown as AuthTokenPayload;
      if (!decoded.exp) return true;
      
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
      return true;
    }
  }
}
