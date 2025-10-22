# Frontend Learning - Монорепо

Учебный проект "Frontend Learning" - монорепо на TypeScript + Express для изучения веб-разработки, архитектуры микросервисов и **безопасной cookie-based session авторизации**.

## 🎯 Описание

Проект представляет собой **SSR блог-платформу с авторизацией**, состоящую из трех микросервисов:
- **Frontend Service** - SSR веб-интерфейс с cookie-based session авторизацией
- **API Service** - REST API для работы со статьями и авторизации (stateless, JWT)
- **Storage Service** - сервис хранения данных (локальный/облачный)
- **Shared Package** - общие типы и утилиты

## 🔐 Архитектура авторизации

Проект использует **безопасную SSR-архитектуру** с **cookie-based session**:

### Ключевые принципы:
✅ **JWT токен в серверной сессии** - браузер никогда не видит токен  
✅ **Cookie `connect.sid`** - единственная cookie в браузере (httpOnly)  
✅ **HTML формы** - без JavaScript для авторизации  
✅ **Серверные проверки** - все валидации на Express  
✅ **Stateless API** - работает по Bearer токенам от фронтенд-сервиса  

### Поток авторизации:
```
Браузер → HTML форма → Frontend Service → API Service → JWT токен
                                 ↓
                         req.session.authToken (сервер)
                                 ↓
                         Cookie: connect.sid (браузер)
```

📚 **Подробная документация:** [COOKIE_SESSION_ARCHITECTURE.md](docs/COOKIE_SESSION_ARCHITECTURE.md)

---

## 🏗️ Архитектура монорепо

```
project-root/
├─ shared/                     # Общие типы и утилиты
│   ├─ src/
│   │   ├─ types/             # TypeScript типы (Article, User, Auth)
│   │   └─ utils/             # Валидация и константы
│   └─ package.json
├─ api/                       # API Service (порт 3001, stateless)
│   ├─ src/
│   │   ├─ controllers/       # Контроллеры (auth, articles, progress)
│   │   ├─ routes/            # API маршруты
│   │   ├─ services/          # JWT, users, storage client
│   │   ├─ middleware/        # JWT auth, валидация, обработка ошибок
│   │   └─ schemas/           # Zod схемы валидации
│   └─ package.json
├─ frontend/                  # Frontend Service (порт 3000, SSR)
│   ├─ src/
│   │   ├─ routes/            # Маршруты (login, registration, my-blog, pages)
│   │   ├─ services/          # HTTP клиенты (API, auth)
│   │   ├─ utils/             # Nunjucks engine для SSR
│   │   └─ public/            # HTML шаблоны (login, registration, my-blog)
│   └─ package.json
├─ storage/                   # Storage Service (порт 3002)
│   ├─ src/
│   │   ├─ adapters/          # Адаптеры (JSON, Firestore)
│   │   ├─ services/          # Сервисы (articles, progress, users, files)
│   │   └─ interfaces/        # Интерфейсы адаптеров
│   ├─ data/                  # Локальное хранилище (JSON)
│   │   ├─ articles.json
│   │   ├─ users.json
│   │   ├─ progress.json
│   │   └─ days/              # HTML файлы и скриншоты
│   └─ package.json
├─ package.json              # Корневой package.json с workspaces
├─ tsconfig.json             # Корневая TypeScript конфигурация
├─ Makefile                  # Команды для разработки
├─ docker-compose.yml        # Docker конфигурация
└─ openapi.yml               # OpenAPI спецификация
```

---

## 📊 Модели данных

### Article (Статья)
```typescript
interface Article {
  id: number;              // автоинкремент
  user_id: number;         // ID автора
  date: string;            // ISO дата создания
  title: string;           // заголовок (обязательный)
  text: string | null;     // текст статьи
  screenshot: string | null; // путь к скриншоту
  source: string | null;   // путь к исходному HTML файлу
  content: string | null;  // экранированный HTML из source
}
```

### User (Пользователь)
```typescript
interface User {
  id: number;              // автоинкремент
  email?: string;          // email (опционально)
  name: string;            // имя пользователя (уникальное)
  password: string;        // хэш пароля (bcrypt)
  role: 'student' | 'admin'; // роль
  createdAt: string;       // ISO дата регистрации
}
```

### ProgressNote (Запись прогресса)
```typescript
interface ProgressNote {
  id: number;
  user_id: number;
  day: string;                          // day-01, day-02, etc.
  topic: string;
  sessionType: 'чтение' | 'кодинг' | 'мини-проект' | 'повторение';
  practice: string;
  files: string[];
  confidence: number;                   // 1-5
  repeat: boolean;
  comment: string | null;
  date: string;
}
```

---

## 🔌 API Endpoints

### 🔐 Авторизация (API Service)

#### POST /auth/register
Регистрация нового пользователя.

**Тело запроса:**
```json
{
  "email": "user@example.com",  // опционально
  "name": "username",            // опционально (один из email/name обязателен)
  "password": "password123",     // минимум 6 символов
  "confirmPassword": "password123"
}
```

**Ответ (201):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "user": {
      "id": 1,
      "name": "username",
      "email": "user@example.com",
      "role": "student"
    }
  }
}
```

#### POST /auth/login
Вход в систему.

**Тело запроса:**
```json
{
  "email": "user@example.com",   // или name
  "name": "username",             // или email
  "password": "password123"
}
```

**Ответ (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token_here",
    "user": { "id": 1, "name": "username", "role": "student" }
  }
}
```

#### GET /auth/me
Получить информацию о текущем пользователе.

**Заголовки:** `Authorization: Bearer <token>`

**Ответ (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "username",
    "email": "user@example.com",
    "role": "student"
  }
}
```

#### POST /auth/logout
Выход из системы (для совместимости, API stateless).

---

### 📝 Статьи (API Service)

> **Требуется авторизация:** `Authorization: Bearer <token>`

#### GET /articles
Получить все статьи текущего пользователя.

**Ответ (200):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "date": "2024-09-11T07:17:13.000Z",
    "title": "Мой первый день с HTML",
    "text": "Сегодня я узнал о тегах...",
    "screenshot": "days/day-01/screenshot.png",
    "source": "days/day-02/semantic.html",
    "content": "&lt;html&gt;...&lt;/html&gt;"
  }
]
```

#### POST /articles
Создать новую статью.

**Тело запроса:**
```json
{
  "title": "Заголовок статьи",
  "text": "Текст статьи (опционально)",
  "screenshot": "путь/к/скриншоту.png (опционально)",
  "source": "путь/к/файлу.html (опционально)"
}
```

#### PUT /articles/:id
Обновить статью.

#### DELETE /articles/:id
Удалить статью.

---

### 📊 Прогресс (API Service)

> **Требуется авторизация:** `Authorization: Bearer <token>`

#### GET /progress-notes
Получить все записи прогресса текущего пользователя.

#### POST /progress-notes
Создать новую запись прогресса.

**Тело запроса:**
```json
{
  "day": "day-01",
  "topic": "HTML basics",
  "sessionType": "чтение",
  "practice": "Изучил теги HTML",
  "confidence": 4,
  "repeat": false,
  "comment": "Всё понятно"
}
```

---

### 🌐 Frontend Routes (Frontend Service)

#### Публичные маршруты:
- `GET /` - Главная страница (публичный блог)
- `GET /login` - Страница входа
- `GET /registration` - Страница регистрации

#### POST маршруты авторизации:
- `POST /login` - Обработка входа (сохраняет токен в сессию)
- `POST /registration` - Обработка регистрации (сохраняет токен в сессию)
- `POST /logout` - Выход (очистка сессии)

#### Защищённые маршруты (требуют авторизации):
- `GET /my-blog` - Личный блог пользователя
- `POST /articles` - Создание статьи (через форму)
- `POST /progress-notes` - Создание записи прогресса (через форму)

---

## 🚀 Установка и запуск

### Быстрый старт (рекомендуется)

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd frontend-learning

# 2. Создать .env файл
cp env.example .env
# Отредактировать .env и установить SESSION_SECRET и JWT_ACCESS_SECRET

# 3. Полная пересборка проекта
make reset

# 4. Запуск всех сервисов в режиме разработки
make dev

# Или в production режиме
make start
```

### Пошаговая установка

#### 1. Установка зависимостей
```bash
# Установка всех зависимостей для монорепо
yarn install

# Или через Makefile
make install
```

#### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта (см. раздел "Переменные окружения" ниже).

**⚠️ ВАЖНО:** Обязательно установите:
- `SESSION_SECRET` - для express-session
- `JWT_ACCESS_SECRET` - для JWT токенов

#### 3. Сборка всех проектов
```bash
# Сборка всех сервисов
yarn build

# Или через Makefile
make build
```

#### 4. Запуск в режиме разработки

**Запуск всех сервисов одновременно:**
```bash
# Через Makefile (рекомендуется)
make dev

# Или вручную в отдельных терминалах:
# Терминал 1 - Storage Service
yarn dev:storage

# Терминал 2 - API Service  
yarn dev:api

# Терминал 3 - Frontend Service
yarn dev:frontend
```

**Запуск отдельных сервисов:**
```bash
# Только Storage Service
yarn dev:storage

# Только API Service
yarn dev:api

# Только Frontend Service
yarn dev:frontend

# Только Shared Package (watch mode)
yarn dev:shared
```

---

## 🌐 Доступные URL

После запуска всех сервисов доступны следующие адреса:

### Frontend Service (порт 3000)
- **🏠 Главная страница (публичный блог):** http://localhost:3000/
- **🔐 Страница входа:** http://localhost:3000/login
- **📝 Страница регистрации:** http://localhost:3000/registration
- **📚 Личный блог (требует авторизации):** http://localhost:3000/my-blog
- **🏥 Health check:** http://localhost:3000/health

### API Service (порт 3001)
- **📖 API документация (Swagger UI):** http://localhost:3001/api-docs
- **🔐 Авторизация:** http://localhost:3001/auth/*
- **📝 API статей:** http://localhost:3001/articles
- **📊 API прогресса:** http://localhost:3001/progress-notes
- **🏥 Health check:** http://localhost:3001/health

### Storage Service (порт 3002)
- **🏥 Health check:** http://localhost:3002/health

---

## 🔧 Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Порты сервисов
FRONTEND_PORT=3000
API_PORT=3001
STORAGE_PORT=3002

# URL сервисов для межсервисного взаимодействия
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001
STORAGE_URL=http://localhost:3002

# 🔐 БЕЗОПАСНОСТЬ (обязательно изменить в production!)
SESSION_SECRET=your-super-secret-session-key-change-in-production
JWT_ACCESS_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES=24h

# Конфигурация Storage Service
STORAGE_MODE=local
LOCAL_DB_PATH=./data/articles.json
LOCAL_FILES_PATH=./data/days

# Облачная конфигурация (для cloud режима)
GCLOUD_PROJECT_ID=your-project-id
GCLOUD_CREDENTIALS=./path/to/credentials.json
FIRESTORE_COLLECTION=articles
GCS_BUCKET_NAME=your-bucket-name

# Окружение
NODE_ENV=development
```

**⚠️ ВАЖНО для production:**
- Измените `SESSION_SECRET` и `JWT_ACCESS_SECRET` на сильные случайные строки
- Установите `NODE_ENV=production`
- В `frontend/src/app.ts` установите `cookie: { secure: true }` для HTTPS

---

## 💻 Технологии

### Основные технологии
- **TypeScript 5.x** - типизированный JavaScript с project references
- **Express.js 4.x** - веб-фреймворк для Node.js
- **Express-session** - управление сессиями (cookie-based)
- **Yarn Workspaces** - управление монорепо
- **Axios** - HTTP клиент для межсервисного взаимодействия
- **Nunjucks** - шаблонизатор для SSR

### Авторизация и безопасность
- **jsonwebtoken** - создание и проверка JWT токенов
- **bcryptjs** - хэширование паролей
- **express-session** - серверные сессии с cookie
- **helmet** - безопасность HTTP заголовков
- **cors** - Cross-Origin Resource Sharing
- **express-rate-limit** - защита от DDoS

### Валидация и утилиты
- **Zod** - валидация схем данных
- **fs-extra** - расширенные возможности работы с файлами
- **he** - HTML entity encoding/decoding

### Документация и разработка
- **swagger-ui-express** - Swagger UI для документации API
- **tsx** - TypeScript execution engine для разработки
- **compression** - сжатие ответов

---

## 🏛️ Особенности архитектуры

### 🔐 Cookie-Based Session Авторизация
1. **SSR (Server-Side Rendering)** - HTML генерируется на сервере
2. **JWT в серверной сессии** - токен не попадает в браузер
3. **httpOnly cookie** - защита от XSS атак
4. **Обычные HTML формы** - без клиентского JavaScript
5. **Stateless API** - масштабируемость без хранения сессий

📚 **Подробнее:** [COOKIE_SESSION_ARCHITECTURE.md](docs/COOKIE_SESSION_ARCHITECTURE.md)

### 🏗️ Монорепо структура
1. **Shared Package** - общие типы, валидация и константы
2. **Микросервисная архитектура** - разделение на Frontend, API и Storage
3. **TypeScript Project References** - инкрементальная сборка
4. **Yarn Workspaces** - единое управление зависимостями

### 🛡️ Безопасность
1. **JWT токены** - безопасная авторизация API
2. **Bcrypt** - надёжное хэширование паролей (10 rounds)
3. **Zod валидация** - проверка всех входных данных
4. **HTML экранирование** - защита от XSS
5. **Rate limiting** - защита от brute-force и DDoS
6. **CORS настройки** - контроль доступа
7. **Helmet middleware** - безопасные HTTP заголовки

### 📦 Гибкость хранения
1. **Адаптерная архитектура** - поддержка локального и облачного хранения
2. **JSON Adapter** - локальное хранение в файлах
3. **Firestore Adapter** - облачное хранение в Google Firestore
4. **Автоматическая инициализация** - настройка адаптеров при запуске

---

## 📚 Примеры использования

### Регистрация и логин через веб-интерфейс

```bash
# 1. Открыть браузер
http://localhost:3000/registration

# 2. Заполнить форму регистрации
# - Email или имя пользователя
# - Пароль (минимум 6 символов)
# - Подтверждение пароля

# 3. После регистрации - автоматический вход и redirect на /my-blog
```

### Создание статьи через веб-интерфейс

```bash
# 1. Войти в систему
http://localhost:3000/login

# 2. Перейти на страницу личного блога
http://localhost:3000/my-blog

# 3. Заполнить форму создания статьи в табе "Создать статью"

# 4. Статья автоматически сохраняется с привязкой к пользователю
```

### Создание статьи через API

```bash
# 1. Получить JWT токен (через логин)
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "name": "student1",
    "password": "password123"
  }'

# 2. Использовать токен для создания статьи
curl -X POST http://localhost:3001/articles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Новая статья",
    "text": "Содержимое статьи"
  }'
```

### Проверка здоровья сервисов

```bash
# Frontend Service
curl http://localhost:3000/health

# API Service  
curl http://localhost:3001/health

# Storage Service
curl http://localhost:3002/health
```

---

## 🧪 Тестирование авторизации

### Проверка cookie-based session:

```bash
# 1. Открыть DevTools в браузере
# 2. Application → Cookies → http://localhost:3000
# 3. Проверить наличие cookie: connect.sid (httpOnly)

# 4. Application → Local Storage → http://localhost:3000
# 5. Убедиться что пусто (нет authToken, auth_data, user)
```

### Проверка защиты маршрутов:

```bash
# Попытка доступа без авторизации
curl -v http://localhost:3000/my-blog
# Должен вернуть redirect 302 на /login

# Доступ после логина
# 1. Войти через браузер на /login
# 2. Открыть /my-blog - должна открыться страница
```

---

## 🛠️ Разработка

### Структура команд

**Основные команды Yarn:**
- `yarn build` - сборка всех проектов
- `yarn build:shared` - сборка shared пакета
- `yarn build:api` - сборка API Service
- `yarn build:frontend` - сборка Frontend Service  
- `yarn build:storage` - сборка Storage Service
- `yarn clean` - очистка всех dist папок
- `yarn dev:*` - запуск в режиме разработки

**Команды Makefile (рекомендуется):**
- `make clean` - очистка всех node_modules и dist папок
- `make install` - установка всех зависимостей
- `make build` - сборка всех проектов
- `make reset` - полная пересборка (clean + install + build)
- `make dev` - запуск всех сервисов в режиме разработки
- `make start` - запуск всех сервисов в production режиме
- `make run-storage` - запуск только Storage Service
- `make run-api` - запуск только API Service
- `make run-frontend` - запуск только Frontend Service

📚 **Подробнее:** [MAKEFILE_GUIDE.md](docs/MAKEFILE_GUIDE.md)

### TypeScript Project References

Проект использует TypeScript Project References для:
- Инкрементальной сборки
- Правильных зависимостей между пакетами
- Автоматической пересборки при изменениях

---

## 📖 Документация

### Основная документация:
- **[COOKIE_SESSION_ARCHITECTURE.md](docs/COOKIE_SESSION_ARCHITECTURE.md)** - Подробное описание cookie-based session архитектуры
- **[AUTH_FRONTEND_FIX_SUMMARY.md](docs/AUTH_FRONTEND_FIX_SUMMARY.md)** - Отчёт о миграции на cookie-based auth
- **[MIGRATION_COMPLETE.md](docs/MIGRATION_COMPLETE.md)** - Краткое руководство по миграции

### Архитектура:
- **[ARCHITECTURE_PLAN.md](docs/ARCHITECTURE_PLAN.md)** - Общая архитектура проекта
- **[USERS_AUTH_ARCH_PLAN.md](docs/USERS_AUTH_ARCH_PLAN.md)** - План архитектуры авторизации

### API документация:
- **[openapi.yml](./openapi.yml)** - OpenAPI спецификация
- **Swagger UI:** http://localhost:3001/api-docs (после запуска API)

### Разработка:
- **[MAKEFILE_GUIDE.md](docs/MAKEFILE_GUIDE.md)** - Руководство по Makefile
- **[BUILD_SEQUENCE.md](docs/BUILD_SEQUENCE.md)** - Последовательность сборки

---

## 🐳 Docker

```bash
# Запуск всех сервисов через Docker Compose
docker-compose up -d

# Остановка
docker-compose down
```

---

## 🔧 Устранение неполадок

### Проблема: Cookie не выставляется
**Решение:** Проверьте `SESSION_SECRET` в .env файле

### Проблема: API возвращает 401 Unauthorized
**Решение:** Убедитесь что токен передаётся в заголовке `Authorization: Bearer <token>`

### Проблема: Redirect loop на /login
**Решение:** Проверьте middleware в `frontend/src/app.ts`, убедитесь что нет redirect в middleware

### Проблема: Сессия не сохраняется
**Решение:** Не пересоздавайте `req.session` вручную, используйте напрямую

### Проблема: Порт уже занят
**Решение:** Остановите процессы на портах 3000, 3001, 3002 или измените порты в .env

📚 **Подробнее:** См. раздел "Проблемы и решения" в [MIGRATION_COMPLETE.md](docs/MIGRATION_COMPLETE.md)

---

## 📝 TODO / Планы развития

- [ ] Добавить refresh tokens для автоматического обновления сессии
- [ ] Реализовать "Запомнить меня" через persistent sessions
- [ ] Добавить восстановление пароля через email
- [ ] Реализовать двухфакторную аутентификацию (2FA)
- [ ] Добавить OAuth провайдеры (Google, GitHub)
- [ ] Добавить тесты (Jest, Supertest)
- [ ] Настроить CI/CD pipeline
- [ ] Добавить логирование (Winston, Morgan)
- [ ] Реализовать real-time уведомления (Socket.IO)

---

## 🤝 Участие в разработке

Проект создан в учебных целях. Приветствуются pull requests и issues.

---

## 📄 Лицензия

Учебный проект для изучения веб-разработки, архитектуры микросервисов и безопасной авторизации.

---

## 🎓 Что изучается в проекте

### Backend разработка:
- Express.js и middleware
- RESTful API design
- JWT авторизация
- Cookie-based sessions
- Bcrypt хэширование паролей

### Frontend разработка:
- Server-Side Rendering (SSR)
- Nunjucks шаблонизация
- HTML формы
- Cookie handling

### Архитектура:
- Микросервисная архитектура
- Монорепо структура
- Separation of Concerns
- Stateless vs Stateful services

### Безопасность:
- XSS защита
- CSRF защита
- SQL Injection защита (через валидацию)
- Rate limiting
- Secure sessions

### DevOps:
- Docker containerization
- TypeScript build process
- Yarn workspaces
- Makefile automation

---

**Версия:** 2.0 (SSR + Cookie-Based Session)  
**Дата обновления:** 2025-10-21  
**Статус:** ✅ Готово к использованию
