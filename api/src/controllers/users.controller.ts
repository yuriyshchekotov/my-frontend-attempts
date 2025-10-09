import { Request, Response } from 'express';
import { UsersService } from '../services/usersService';
import { CreateUserData, UpdateUserData, GetUsersQuery } from '../schemas/users.schemas';

export class UsersController {
  private usersService: UsersService;

  constructor(usersService: UsersService) {
    this.usersService = usersService;
  }

  /**
   * GET /users
   * Получить список пользователей (только для админов)
   */
  getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const query = req.query as any;
      
      // Получаем всех пользователей
      const users = await this.usersService.findAll();
      
      // Фильтруем по user_id если указан
      let filteredUsers = users;
      if (query.user_id) {
        filteredUsers = users.filter((user: any) => user.id === query.user_id);
      }
      
      // Фильтруем по роли если указана
      if (query.role) {
        filteredUsers = filteredUsers.filter((user: any) => user.role === query.role);
      }
      
      // Фильтруем по поиску если указан
      if (query.search) {
        const searchTerm = query.search.toLowerCase();
        filteredUsers = filteredUsers.filter((user: any) => 
          user.name.toLowerCase().includes(searchTerm) ||
          (user.email && user.email.toLowerCase().includes(searchTerm))
        );
      }
      
      // Пагинация
      const page = query.page || 1;
      const limit = query.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      // Возвращаем публичную информацию о пользователях
      const publicUsers = paginatedUsers.map((user: any) => this.usersService.getPublicUser(user));
      
      res.json({
        success: true,
        data: {
          users: publicUsers,
          total: filteredUsers.length,
          page,
          limit,
          totalPages: Math.ceil(filteredUsers.length / limit)
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get users'
      });
    }
  };

  /**
   * GET /users/:id
   * Получить пользователя по ID
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
        return;
      }

      const user = await this.usersService.findById(userId);
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
      console.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user'
      });
    }
  };

  /**
   * POST /users
   * Создать нового пользователя (только для админов)
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const data: CreateUserData = req.body;

      // Создаем пользователя
      const user = await this.usersService.create({
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role || 'student'
      });

      const publicUser = this.usersService.getPublicUser(user);

      res.status(201).json({
        success: true,
        data: publicUser
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create user'
      });
    }
  };

  /**
   * PATCH /users/:id
   * Обновить пользователя
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const data: UpdateUserData = req.body;
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
        return;
      }

      const user = await this.usersService.update(userId, data);
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
      console.error('Update user error:', error);
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      });
    }
  };

  /**
   * DELETE /users/:id
   * Удалить пользователя
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid user ID'
        });
        return;
      }

      // Проверяем, что пользователь существует
      const user = await this.usersService.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found'
        });
        return;
      }

      await this.usersService.delete(userId);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }
  };
}
