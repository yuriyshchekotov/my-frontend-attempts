import { Request, Response } from 'express';
import { UsersService } from '../services/usersService';
import { JwtService } from '../services/jwt.service';
import { RegisterData, LoginData } from '../schemas/auth.schemas';
import { generateNameFromEmail } from '@frontend-learning/shared';

export class AuthController {
  private usersService: UsersService;
  private jwtService: JwtService;

  constructor(usersService: UsersService) {
    this.usersService = usersService;
    this.jwtService = new JwtService();
  }

  /**
   * POST /auth/register
   * Регистрация нового пользователя
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: RegisterData = req.body;

      // Если name не указан, но есть email, генерируем name из email
      if (!data.name && data.email) {
        data.name = generateNameFromEmail(data.email);
      }

      // Создаем пользователя
      const user = await this.usersService.create({
        email: data.email,
        name: data.name,
        password: data.password,
        role: 'student' // По умолчанию студент
      });

      // Создаем токен
      const tokenPayload = this.usersService.createTokenPayload(user);
      const accessToken = this.jwtService.signAccess(tokenPayload);

      // Возвращаем публичную информацию о пользователе
      const publicUser = this.usersService.getPublicUser(user);

      res.status(201).json({
        success: true,
        data: {
          accessToken,
          user: publicUser
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed'
      });
    }
  };

  /**
   * POST /auth/login
   * Вход пользователя
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: LoginData = req.body;

      // Ищем пользователя по email или name
      const user = await this.usersService.findByEmailOrName(
        data.email || data.name || ''
      );

      if (!user) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Проверяем пароль
      const isValidPassword = await this.usersService.verifyPassword(user, data.password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
        return;
      }

      // Создаем токен
      const tokenPayload = this.usersService.createTokenPayload(user);
      const accessToken = this.jwtService.signAccess(tokenPayload);

      // Возвращаем публичную информацию о пользователе
      const publicUser = this.usersService.getPublicUser(user);

      res.json({
        success: true,
        data: {
          accessToken,
          user: publicUser
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed'
      });
    }
  };

  /**
   * GET /auth/me
   * Получить информацию о текущем пользователе
   */
  me = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Получаем полную информацию о пользователе
      const user = await this.usersService.findById(req.user.sub);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      const publicUser = this.usersService.getPublicUser(user);

      res.json({
        success: true,
        data: publicUser
      });
    } catch (error) {
      console.error('Get user info error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user information'
      });
    }
  };

  /**
   * POST /auth/logout
   * Выход пользователя (в текущей реализации просто возвращает успех)
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    // В текущей реализации JWT токены не хранятся на сервере,
    // поэтому logout просто возвращает успех
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  };
}


