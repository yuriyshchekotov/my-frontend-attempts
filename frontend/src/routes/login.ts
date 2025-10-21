import { Request, Response } from 'express';
import { AuthClient } from '../services/authClient';
import { NunjucksEngine } from '../utils/nunjucksEngine';
import * as path from 'path';

/**
 * Маршруты для страницы входа
 */
export class LoginRoutes {
  private authClient: AuthClient;
  private templateEngine: NunjucksEngine;

  constructor(apiUrl: string) {
    this.authClient = new AuthClient(apiUrl);
    this.templateEngine = new NunjucksEngine(path.join(process.cwd(), 'src', 'public'));
  }

  /**
   * GET /login - показать страницу входа
   */
  showLoginPage = async (req: Request, res: Response): Promise<void> => {
    try {
      // Если пользователь уже авторизован, перенаправляем на блог
      if (req.user) {
        res.redirect('/my-blog');
        return;
      }

      const html = await this.templateEngine.renderTemplate('login.html', {
        title: 'Вход в систему',
        error: req.query.error as string || null,
        success: req.query.success as string || null,
      });

      res.send(html);
    } catch (error) {
      console.error('Error rendering login page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  /**
   * POST /login - обработка входа
   */
  handleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name, password } = req.body;

      if (!password || (!email && !name)) {
        res.redirect('/login?error=Пожалуйста, заполните все обязательные поля');
        return;
      }

      const loginData = {
        email: email || undefined,
        name: name || undefined,
        password,
      };

      const authResponse = await this.authClient.login(loginData);

      // Сохраняем токен в сессии (для серверного рендеринга)
      req.session.authToken = authResponse.accessToken;
      req.session.user = authResponse.user;

      res.redirect('/my-blog');
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка входа';
      res.redirect(`/login?error=${encodeURIComponent(errorMessage)}`);
    }
  };

  /**
   * POST /logout - выход из системы
   */
  handleLogout = async (req: Request, res: Response): Promise<void> => {
    try {
      const token = req.session?.authToken;
      await this.authClient.logout(token);

      // Очищаем сессию
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });

      res.redirect('/login?success=Вы успешно вышли из системы');
    } catch (error) {
      console.error('Logout error:', error);
      // Даже если произошла ошибка, очищаем сессию
      req.session.destroy((err) => {
        if (err) console.error('Session destroy error:', err);
      });
      res.redirect('/login');
    }
  };
}
