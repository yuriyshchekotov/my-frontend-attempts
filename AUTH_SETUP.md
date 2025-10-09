# 🔐 Настройка системы авторизации

## 📋 Обзор

Реализована полноценная система авторизации и разделения пользователей в проекте "Training Blog":

- **JWT-авторизация** с токенами доступа
- **Разделение пользователей** по ролям (student/admin)
- **Многопользовательский режим** с привязкой данных к user_id
- **Защищенные маршруты** с проверкой прав доступа
- **Современный UI** для входа, регистрации и личного блога

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
# Установка всех зависимостей
yarn install

# Сборка всех сервисов
yarn build
```

### 2. Настройка переменных окружения

Создайте файлы `.env` в каждом сервисе:

**api/.env:**
```env
API_PORT=3001
STORAGE_URL=http://localhost:3002
JWT_ACCESS_SECRET=dev_secret_change_me_in_production
JWT_ACCESS_EXPIRES=15m
STORAGE_DATA_PATH=./storage/data
```

**storage/.env:**
```env
STORAGE_PORT=3002
STORAGE_MODE=local
STORAGE_DATA_PATH=./data
```

**frontend/.env:**
```env
FRONTEND_PORT=3000
API_URL=http://localhost:3001
```

### 3. Инициализация данных

```bash
# Создание администратора по умолчанию
cd storage
yarn tsx scripts/seed.ts
```

### 4. Запуск сервисов

```bash
# В отдельных терминалах:

# Storage Service
cd storage && yarn dev

# API Service  
cd api && yarn dev

# Frontend Service
cd frontend && yarn dev
```

## 👥 Пользователи по умолчанию

После инициализации доступны:

- **Администратор**: `admin` / `admin123`
- **Студент**: `student1` / `student123`

## 🔧 API Endpoints

### Авторизация
- `POST /auth/register` - Регистрация
- `POST /auth/login` - Вход
- `GET /auth/me` - Информация о пользователе
- `POST /auth/logout` - Выход

### Пользователи (только для админов)
- `GET /users` - Список пользователей
- `POST /users` - Создание пользователя
- `GET /users/:id` - Получение пользователя
- `PATCH /users/:id` - Обновление пользователя
- `DELETE /users/:id` - Удаление пользователя

### Статьи (требуют авторизации)
- `GET /articles` - Список статей (только свои для студентов)
- `POST /articles` - Создание статьи
- `GET /articles/:id` - Получение статьи
- `PUT /articles/:id` - Обновление статьи
- `DELETE /articles/:id` - Удаление статьи

### Прогресс (требуют авторизации)
- `GET /progress-notes` - Список записей (только свои для студентов)
- `POST /progress-notes` - Создание записи
- `GET /progress-notes/:id` - Получение записи
- `PUT /progress-notes/:id` - Обновление записи
- `DELETE /progress-notes/:id` - Удаление записи

## 🎨 Frontend маршруты

- `/` - Главная страница (редирект на /my-blog если авторизован)
- `/login` - Страница входа
- `/registration` - Страница регистрации
- `/my-blog` - Личный блог пользователя

## 🔒 Безопасность

### JWT Токены
- **Access Token**: 15 минут жизни
- **Передача**: `Authorization: Bearer <token>`
- **Хранение**: localStorage (frontend)

### Роли и права
- **Student**: видит только свои данные
- **Admin**: видит все данные, может управлять пользователями

### Валидация
- **Zod схемы** для всех входных данных
- **bcrypt** для хеширования паролей
- **Rate limiting** на API endpoints

## 🗂️ Структура данных

### User
```typescript
{
  id: number;
  email?: string;
  name: string;
  passwordHash: string;
  role: 'student' | 'admin';
  createdAt: string;
  updatedAt: string;
}
```

### Article (обновлена)
```typescript
{
  id: number;
  user_id: number;  // ← Новое поле
  date: string;
  title: string;
  text: string | null;
  screenshot: string | null;
  source: string | null;
  content: string | null;
}
```

### ProgressNote (обновлена)
```typescript
{
  id: number;
  user_id: number;  // ← Новое поле
  date: string;
  day: string;
  topic: string;
  sessionType: 'чтение' | 'кодинг' | 'мини-проект' | 'повторение';
  practice: string;
  files: string[];
  confidence: number;
  repeat: boolean;
  comment: string | null;
}
```

## 🧪 Тестирование

### Ручные тесты

1. **Регистрация нового пользователя**
   ```bash
   curl -X POST http://localhost:3001/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"testuser","password":"test123","confirmPassword":"test123"}'
   ```

2. **Вход пользователя**
   ```bash
   curl -X POST http://localhost:3001/auth/login \
     -H "Content-Type: application/json" \
     -d '{"name":"testuser","password":"test123"}'
   ```

3. **Получение статей (с токеном)**
   ```bash
   curl -X GET http://localhost:3001/articles \
     -H "Authorization: Bearer <your-token>"
   ```

### Сценарии тестирования

1. ✅ Регистрация без email, но с name
2. ✅ Регистрация с email без name (name генерируется из email)
3. ✅ Вход по email / name
4. ✅ Студент не видит чужие статьи/прогресс
5. ✅ Админ видит всех (`?user_id` работает)
6. ✅ Ошибки валидации → 400
7. ✅ Проверка прав доступа → 403

## 🔄 Миграция данных

Существующие данные автоматически получают `user_id = 1` (администратор) для совместимости.

## 📝 Логи и отладка

```bash
# Просмотр логов всех сервисов
yarn log

# Проверка здоровья сервисов
curl http://localhost:3000/health  # Frontend
curl http://localhost:3001/health  # API
curl http://localhost:3002/health  # Storage
```

## 🚨 Важные замечания

1. **JWT Secret**: Обязательно измените `JWT_ACCESS_SECRET` в продакшене
2. **Пароли**: Используйте сильные пароли в продакшене
3. **HTTPS**: В продакшене используйте HTTPS для передачи токенов
4. **Сессии**: В текущей реализации сессии не используются, все через JWT

## 🔮 Планы на будущее

- [ ] Refresh токены
- [ ] Публичные блоги `/u/:name`
- [ ] Поиск пользователей
- [ ] Ротация JWT ключей
- [ ] Двухфакторная аутентификация


