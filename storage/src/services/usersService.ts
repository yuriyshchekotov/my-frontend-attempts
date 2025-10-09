import { User, NewUser, UpdateUser, UserPublic, StorageResult } from '@frontend-learning/shared';
import { UsersStore } from './users.store';

/**
 * Сервис для работы с пользователями
 */
export class UsersService {
  private usersStore: UsersStore;

  constructor(usersStore: UsersStore) {
    this.usersStore = usersStore;
  }

  /**
   * Инициализация сервиса
   */
  async initialize(): Promise<void> {
    await this.usersStore.initialize();
  }

  /**
   * Получить пользователя по email или name
   */
  async getUserByEmailOrName(emailOrName: string): Promise<StorageResult<User | null>> {
    return await this.usersStore.getUserByEmailOrName(emailOrName);
  }

  /**
   * Получить пользователя по ID
   */
  async getUserById(id: number): Promise<StorageResult<User | null>> {
    return await this.usersStore.getUserById(id);
  }

  /**
   * Получить всех пользователей
   */
  async getAllUsers(): Promise<StorageResult<User[]>> {
    return await this.usersStore.getAllUsers();
  }

  /**
   * Создать нового пользователя
   */
  async createUser(userData: NewUser): Promise<StorageResult<User>> {
    return await this.usersStore.createUser(userData);
  }

  /**
   * Обновить пользователя
   */
  async updateUser(id: number, userData: UpdateUser): Promise<StorageResult<User | null>> {
    return await this.usersStore.updateUser(id, userData);
  }

  /**
   * Удалить пользователя
   */
  async deleteUser(id: number): Promise<StorageResult<boolean>> {
    return await this.usersStore.deleteUser(id);
  }

  /**
   * Проверить пароль пользователя
   */
  async verifyPassword(user: User, password: string): Promise<boolean> {
    return await this.usersStore.verifyPassword(user, password);
  }

  /**
   * Получить публичную информацию о пользователе (без пароля)
   */
  getUserPublic(user: User): UserPublic {
    return this.usersStore.getUserPublic(user);
  }
}
