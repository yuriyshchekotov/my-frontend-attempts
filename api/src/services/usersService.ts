import { User, NewUser, UpdateUser, UserPublic } from '@frontend-learning/shared';
import { StorageClient } from './storageClient';

/**
 * Сервис для работы с пользователями через Storage Service
 */
export class UsersService {
  private storageClient: StorageClient;

  constructor(storageClient: StorageClient) {
    this.storageClient = storageClient;
  }

  /**
   * Найти пользователя по email или имени
   */
  async findByEmailOrName(emailOrName: string): Promise<User | null> {
    return await this.storageClient.findUserByEmailOrName(emailOrName);
  }

  /**
   * Найти пользователя по ID
   */
  async findById(id: number): Promise<User | null> {
    return await this.storageClient.getUserById(id);
  }

  /**
   * Получить всех пользователей
   */
  async findAll(): Promise<User[]> {
    return await this.storageClient.getAllUsers();
  }

  /**
   * Создать нового пользователя
   */
  async create(userData: NewUser): Promise<User> {
    // Storage Service сам хеширует пароль
    return await this.storageClient.createUser(userData);
  }

  /**
   * Обновить пользователя
   */
  async update(id: number, userData: UpdateUser): Promise<User | null> {
    // Storage Service сам хеширует пароль
    return await this.storageClient.updateUser(id, userData);
  }

  /**
   * Удалить пользователя
   */
  async delete(id: number): Promise<boolean> {
    return await this.storageClient.deleteUser(id);
  }

  /**
   * Проверить пароль пользователя
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await this.storageClient.verifyUserPassword(user.id, password);
  }

  /**
   * Создать payload для JWT токена
   */
  createTokenPayload(user: User) {
    return {
      sub: user.id,
      name: user.name,
      role: user.role
    };
  }

  /**
   * Получить публичную информацию о пользователе (без пароля)
   */
  getPublicUser(user: User): UserPublic {
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
