import { Request, Response } from 'express';
import { AuthClient } from '../services/authClient';
import { AuthGuard } from '../utils/authGuard';
import { TemplateEngine } from '../utils/templateEngine';
import * as path from 'path';

/**
 * Маршруты для страницы входа
 */
export class LoginRoutes {
  private authClient: AuthClient;
  private templateEngine: TemplateEngine;

  constructor(apiUrl: string) {
    this.authClient = new AuthClient(apiUrl);
    this.templateEngine = new TemplateEngine(path.join(process.cwd(), 'src', 'public'));
  }

  /**
   * GET /login - показать страницу входа
   */
  showLoginPage = async (req: Request, res: Response): Promise<void> => {
    try {
      // Если пользователь уже авторизован, перенаправляем на главную
      if (req.user) {
        res.redirect('/');
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
      if (!req.session) {
        req.session = {} as any;
      }
      req.session.authToken = authResponse.accessToken;
      req.session.user = authResponse.user;

      res.redirect('/');
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
      
      if (token) {
        await this.authClient.logout(token);
      }

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
