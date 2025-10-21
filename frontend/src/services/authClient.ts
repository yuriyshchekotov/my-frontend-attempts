import axios, { AxiosResponse } from 'axios';
import { AuthResponse, UserPublic, RegisterData, LoginData } from '@frontend-learning/shared';

/**
 * Клиент для работы с API авторизации
 * ⚠️ ВАЖНО: Этот класс используется только на сервере (в маршрутах Express)
 * Не должен использоваться в браузерном JavaScript
 * В SSR-архитектуре авторизация проверяется через req.session, а не через API вызовы
 */
export class AuthClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  /**
   * Регистрация нового пользователя
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<{ success: boolean; data: AuthResponse }> = await axios.post(
        `${this.baseURL}/auth/register`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error('Registration failed');
      }

      const authResponse = response.data.data;
      
      return authResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        throw new Error(message);
      }
      throw error;
    }
  }

  /**
   * Вход пользователя
   */
  async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<{ success: boolean; data: AuthResponse }> = await axios.post(
        `${this.baseURL}/auth/login`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error('Login failed');
      }

      const authResponse = response.data.data;
      
      return authResponse;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        throw new Error(message);
      }
      throw error;
    }
  }

  /**
   * Получить информацию о текущем пользователе
   */
  async getCurrentUser(token: string): Promise<UserPublic> {
    try {
      const response: AxiosResponse<{ success: boolean; data: UserPublic }> = await axios.get(
        `${this.baseURL}/auth/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        throw new Error('Failed to get user info');
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.error || error.message;
        throw new Error(message);
      }
      throw error;
    }
  }

  /**
   * Выход пользователя
   */
  async logout(token?: string): Promise<void> {
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await axios.post(
        `${this.baseURL}/auth/logout`,
        {},
        { headers }
      );
    } catch (error) {
      // В текущей реализации logout всегда успешен
      console.log('Logged out');
    }
  }

  /**
   * Проверить валидность токена
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      await this.getCurrentUser(token);
      return true;
    } catch {
      return false;
    }
  }
}


