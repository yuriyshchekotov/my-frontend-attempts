import { User, NewUser, UpdateUser, UserPublic, StorageResult } from '@frontend-learning/shared';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

/**
 * Сервис для работы с пользователями в JSON файле
 */
export class UsersStore {
  private usersPath: string;
  private users: User[] = [];
  private nextId: number = 1;

  constructor(dataPath: string) {
    this.usersPath = path.join(dataPath, 'users.json');
  }

  /**
   * Инициализация хранилища пользователей
   */
  async initialize(): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.usersPath));
      
      if (await fs.pathExists(this.usersPath)) {
        const data = await fs.readJson(this.usersPath);
        this.users = data.users || [];
        this.nextId = data.nextId || 1;
      } else {
        // Создаем файл с пустым массивом пользователей
        await this.saveUsers();
      }
    } catch (error) {
      console.error('Error initializing users store:', error);
      throw error;
    }
  }

  /**
   * Сохранение пользователей в файл
   */
  private async saveUsers(): Promise<void> {
    try {
      await fs.writeJson(this.usersPath, {
        users: this.users,
        nextId: this.nextId
      }, { spaces: 2 });
    } catch (error) {
      console.error('Error saving users:', error);
      throw error;
    }
  }

  /**
   * Получить пользователя по email или name
   */
  async getUserByEmailOrName(emailOrName: string): Promise<StorageResult<User | null>> {
    try {
      const user = this.users.find(u => 
        u.email === emailOrName || u.name === emailOrName
      );
      
      return {
        success: true,
        data: user || null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Получить пользователя по ID
   */
  async getUserById(id: number): Promise<StorageResult<User | null>> {
    try {
      const user = this.users.find(u => u.id === id);
      
      return {
        success: true,
        data: user || null
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Получить всех пользователей
   */
  async getAllUsers(): Promise<StorageResult<User[]>> {
    try {
      return {
        success: true,
        data: [...this.users]
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Создать нового пользователя
   */
  async createUser(userData: NewUser): Promise<StorageResult<User>> {
    try {
      // Проверяем, что email или name не заняты
      if (userData.email) {
        const existingByEmail = this.users.find(u => u.email === userData.email);
        if (existingByEmail) {
          return {
            success: false,
            error: 'User with this email already exists'
          };
        }
      }

      const existingByName = this.users.find(u => u.name === userData.name);
      if (existingByName) {
        return {
          success: false,
          error: 'User with this name already exists'
        };
      }

      // Хешируем пароль
      const passwordHash = await bcrypt.hash(userData.password, 12);

      const newUser: User = {
        id: this.nextId++,
        email: userData.email,
        name: userData.name || 'user',
        passwordHash,
        role: userData.role || 'student',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      this.users.push(newUser);
      await this.saveUsers();

      return {
        success: true,
        data: newUser
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Обновить пользователя
   */
  async updateUser(id: number, userData: UpdateUser): Promise<StorageResult<User | null>> {
    try {
      const userIndex = this.users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const existingUser = this.users[userIndex];

      // Проверяем уникальность email и name
      if (userData.email && userData.email !== existingUser.email) {
        const existingByEmail = this.users.find(u => u.email === userData.email && u.id !== id);
        if (existingByEmail) {
          return {
            success: false,
            error: 'User with this email already exists'
          };
        }
      }

      if (userData.name && userData.name !== existingUser.name) {
        const existingByName = this.users.find(u => u.name === userData.name && u.id !== id);
        if (existingByName) {
          return {
            success: false,
            error: 'User with this name already exists'
          };
        }
      }

      // Обновляем данные
      const updatedUser: User = {
        ...existingUser,
        email: userData.email !== undefined ? userData.email : existingUser.email,
        name: userData.name !== undefined ? userData.name : existingUser.name,
        passwordHash: userData.password ? await bcrypt.hash(userData.password, 12) : existingUser.passwordHash,
        role: userData.role !== undefined ? userData.role : existingUser.role,
        updatedAt: new Date().toISOString()
      };

      this.users[userIndex] = updatedUser;
      await this.saveUsers();

      return {
        success: true,
        data: updatedUser
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Удалить пользователя
   */
  async deleteUser(id: number): Promise<StorageResult<boolean>> {
    try {
      const userIndex = this.users.findIndex(u => u.id === id);
      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      this.users.splice(userIndex, 1);
      await this.saveUsers();

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Проверить пароль пользователя
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, user.passwordHash);
    } catch (error) {
      console.error('Error verifying password:', error);
      return false;
    }
  }

  /**
   * Получить публичную информацию о пользователе (без пароля)
   */
  getUserPublic(user: User): UserPublic {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}
