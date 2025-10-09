import { Request, Response } from 'express';
import { AuthClient } from '../services/authClient';
import { NunjucksEngine } from '../utils/nunjucksEngine';
import * as path from 'path';

/**
 * Маршруты для страницы регистрации
 */
export class RegistrationRoutes {
  private authClient: AuthClient;
  private templateEngine: NunjucksEngine;

  constructor(apiUrl: string) {
    this.authClient = new AuthClient(apiUrl);
    this.templateEngine = new NunjucksEngine(path.join(process.cwd(), 'src', 'public'));
  }

  /**
   * GET /registration - показать страницу регистрации
   */
  showRegistrationPage = async (req: Request, res: Response): Promise<void> => {
    try {
      // Если пользователь уже авторизован, перенаправляем на главную
      if (req.user) {
        res.redirect('/');
        return;
      }

      const html = await this.templateEngine.renderTemplate('registration.html', {
        title: 'Регистрация',
        error: req.query.error as string || null,
        success: req.query.success as string || null,
      });

      res.send(html);
    } catch (error) {
      console.error('Error rendering registration page:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  /**
   * POST /registration - обработка регистрации
   */
  handleRegistration = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, name, password, confirmPassword } = req.body;

      // Валидация
      if (!password || password.length < 6) {
        res.redirect('/registration?error=Пароль должен содержать минимум 6 символов');
        return;
      }

      if (password !== confirmPassword) {
        res.redirect('/registration?error=Пароли не совпадают');
        return;
      }

      if (!email && !name) {
        res.redirect('/registration?error=Укажите email или имя');
        return;
      }

      const registrationData = {
        email: email || undefined,
        name: name || undefined,
        password,
        confirmPassword,
      };

      const authResponse = await this.authClient.register(registrationData);

      // Сохраняем токен в сессии
      if (!req.session) {
        req.session = {} as any;
      }
      req.session.authToken = authResponse.accessToken;
      req.session.user = authResponse.user;

      res.redirect('/?success=Регистрация прошла успешно');
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ошибка регистрации';
      res.redirect(`/registration?error=${encodeURIComponent(errorMessage)}`);
    }
  };
}
