# Frontend Learning - Монорепо

Учебный проект "Frontend Learning" - монорепо на TypeScript + Express для изучения веб-разработки и архитектуры микросервисов.

## Описание

Проект представляет собой блог-платформу, состоящую из трех микросервисов:
- **Frontend Service** - веб-интерфейс для отображения блога
- **API Service** - REST API для работы со статьями
- **Storage Service** - сервис хранения данных (локальный/облачный)
- **Shared Package** - общие типы и утилиты

## Архитектура монорепо

```
project-root/
├─ shared/                     # Общие типы и утилиты
│   ├─ src/
│   │   ├─ types/             # TypeScript типы (Article, File, Storage)
│   │   └─ utils/             # Валидация и константы
│   └─ package.json
├─ api/                       # API Service (порт 3001)
│   ├─ src/
│   │   ├─ controllers/       # Контроллеры для статей
│   │   ├─ routes/            # API маршруты
│   │   ├─ services/          # HTTP клиент для Storage
│   │   └─ middleware/        # Валидация и обработка ошибок
│   └─ package.json
├─ frontend/                  # Frontend Service (порт 3000)
│   ├─ src/
│   │   ├─ routes/            # Маршруты страниц
│   │   ├─ services/          # HTTP клиент для API
│   │   ├─ utils/             # Движок шаблонов
│   │   └─ public/            # HTML шаблоны
│   └─ package.json
├─ storage/                   # Storage Service (порт 3002)
│   ├─ src/
│   │   ├─ adapters/          # Адаптеры (JSON, Firestore)
│   │   ├─ services/          # Сервисы хранения и файлов
│   │   └─ interfaces/        # Интерфейсы адаптеров
│   └─ package.json
├─ data/                      # Данные (статьи и файлы)
│   ├─ articles.json         # База статей
│   └─ days/                 # HTML файлы уроков
├─ legacy/                    # Легаси код (старая структура)
├─ package.json              # Корневой package.json с workspaces
├─ tsconfig.json             # Корневая TypeScript конфигурация
└─ openapi.yml               # OpenAPI спецификация
```

## Модель статьи

```typescript
interface Article {
  id: number;              // автоинкремент
  date: string;            // ISO дата
  title: string;           // заголовок (обязательный)
  text: string | null;     // текст статьи
  screenshot: string | null; // путь к скриншоту
  source: string | null;   // путь к исходному HTML файлу
  content: string | null;  // экранированный HTML из source
}
```

## API Endpoints

### GET /articles
Возвращает массив всех статей.

**Пример ответа:**
```json
[
  {
    "id": 1,
    "date": "2024-09-11T07:17:13.000Z",
    "title": "Мой первый день с HTML",
    "text": "Сегодня я узнал о тегах...",
    "screenshot": "days/day-01/screenshot.png",
    "source": "days/day-02/semantic.html",
    "content": "&lt;html&gt;...&lt;/html&gt;"
  }
]
```

### POST /articles
Создает новую статью.

**Тело запроса:**
```json
{
  "title": "Заголовок статьи",
  "text": "Текст статьи (опционально)",
  "screenshot": "путь/к/скриншоту.png (опционально)",
  "source": "путь/к/файлу.html (опционально)"
}
```

**Валидация:**
- `title` - обязательное поле
- `screenshot` - должен существовать в `data/` и иметь расширение `.png`, `.jpg` или `.jpeg`
- `source` - должен существовать в `data/` как HTML файл

**Пример ответа (201):**
```json
{
  "id": 2,
  "date": "2024-09-14T05:13:04.716Z",
  "title": "Заголовок статьи",
  "text": "Текст статьи",
  "screenshot": "путь/к/скриншоту.png",
  "source": "путь/к/файлу.html",
  "content": "&lt;html&gt;...&lt;/html&gt;"
}
```

**Ошибки (400):**
```json
{
  "error": "Поле title обязательно и должно быть строкой"
}
```

### GET /
Главная страница блога с рендерингом всех статей.

## Установка и запуск

### Быстрый старт (рекомендуется)

**Полная пересборка проекта:**
```bash
make reset
```

**Запуск всех сервисов в режиме разработки:**
```bash
make dev
```

**Запуск всех сервисов в production режиме:**
```bash
make start
```

### Пошаговая установка

### 1. Установка зависимостей
```bash
# Установка всех зависимостей для монорепо
yarn install

# Или через Makefile
make install
```

### 2. Сборка всех проектов
```bash
# Сборка всех сервисов
yarn build

# Или через Makefile
make build
```

### 3. Запуск в режиме разработки

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

### 4. Сборка отдельных проектов
```bash
# Сборка shared пакета
yarn build:shared

# Сборка API Service
yarn build:api

# Сборка Frontend Service
yarn build:frontend

# Сборка Storage Service
yarn build:storage
```

### 5. Очистка и пересборка
```bash
# Очистка всех артефактов
make clean

# Полная пересборка (очистка + установка + сборка)
make reset

# Или через yarn
yarn clean
```

## Доступные URL

После запуска всех сервисов доступны следующие адреса:

### Frontend Service (порт 3000)
- **Главная страница блога:** http://localhost:3000/
- **Страница создания статьи:** http://localhost:3000/create
- **Статические файлы:** http://localhost:3000/data/...
- **Health check:** http://localhost:3000/health

### API Service (порт 3001)
- **API документация (Swagger UI):** http://localhost:3001/api-docs
- **API статей:** http://localhost:3001/articles
- **Health check:** http://localhost:3001/health

### Storage Service (порт 3002)
- **Health check:** http://localhost:3002/health

## Технологии

### Основные технологии
- **TypeScript** - типизированный JavaScript с поддержкой project references
- **Express.js** - веб-фреймворк для Node.js
- **Yarn Workspaces** - управление монорепо
- **Axios** - HTTP клиент для межсервисного взаимодействия

### Дополнительные библиотеки
- **Zod** - валидация схем данных
- **fs-extra** - расширенные возможности работы с файловой системой
- **he** - HTML entity encoding/decoding
- **swagger-ui-dist** - Swagger UI для документации API
- **tsx** - TypeScript execution engine для разработки
- **helmet** - безопасность HTTP заголовков
- **cors** - Cross-Origin Resource Sharing
- **compression** - сжатие ответов
- **express-rate-limit** - ограничение частоты запросов

## Особенности архитектуры

### Монорепо структура
1. **Shared Package** - общие типы, валидация и константы
2. **Микросервисная архитектура** - разделение на Frontend, API и Storage
3. **TypeScript Project References** - инкрементальная сборка
4. **Yarn Workspaces** - единое управление зависимостями

### Безопасность и производительность
1. **Валидация данных** - Zod схемы для всех входных данных
2. **HTML экранирование** - безопасное отображение контента
3. **Rate limiting** - защита от DDoS атак
4. **CORS настройки** - безопасное межсервисное взаимодействие
5. **Health checks** - мониторинг состояния сервисов

### Гибкость хранения
1. **Адаптерная архитектура** - поддержка локального и облачного хранения
2. **JSON Adapter** - локальное хранение в файлах
3. **Firestore Adapter** - облачное хранение в Google Firestore
4. **Автоматическая инициализация** - настройка адаптеров при запуске

## Примеры использования

### Создание статьи через API Service
```bash
curl -X POST http://localhost:3001/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Новая статья",
    "text": "Содержимое статьи"
  }'
```

### Получение всех статей
```bash
curl http://localhost:3001/articles
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

## Переменные окружения

Создайте файл `.env` в корне проекта:

```env
# Порты сервисов
FRONTEND_PORT=3000
API_PORT=3001
STORAGE_PORT=3002

# URL сервисов для межсервисного взаимодействия
API_URL=http://localhost:3001
STORAGE_URL=http://localhost:3002

# Конфигурация Storage Service
STORAGE_MODE=local
LOCAL_DB_PATH=./data/articles.json
LOCAL_FILES_PATH=./data/days

# Облачная конфигурация (для cloud режима)
GCLOUD_PROJECT_ID=your-project-id
GCLOUD_CREDENTIALS=./path/to/credentials.json
FIRESTORE_COLLECTION=articles
GCS_BUCKET_NAME=your-bucket-name
```

## Разработка

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

### TypeScript Project References
Проект использует TypeScript Project References для:
- Инкрементальной сборки
- Правильных зависимостей между пакетами
- Автоматической пересборки при изменениях

## Лицензия

Учебный проект для изучения веб-разработки и архитектуры микросервисов.

