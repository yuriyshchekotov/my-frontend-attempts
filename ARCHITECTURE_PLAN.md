# План архитектурного разделения проекта на микросервисы

## Общая архитектурная стратегия

Проект будет разделен на следующие основные компоненты:

### 1. **Frontend Service** (Веб-приложение)
- **Назначение**: Server-side rendering HTML страниц, статические файлы
- **Технологии**: Express.js, TypeScript, HTML шаблоны
- **Порт**: 3000

### 2. **API Service** (Backend API)
- **Назначение**: REST API для работы с данными, бизнес-логика
- **Технологии**: Express.js, TypeScript, OpenAPI/Swagger
- **Порт**: 3001

### 3. **Storage Service** (Слой данных)
- **Назначение**: Единый интерфейс для работы с данными и файлами. В зависимости от переменных окружения (`.env`) использует локальные адаптеры (JSON + файловая система) или облачные адаптеры (Firestore + Google Cloud Storage).
- **Технологии**: TypeScript, адаптеры для разных хранилищ (локальные и облачные), конфигурация через `dotenv`.
- **Порт**: Внутренний (не экспонируется)

### 4. **Shared Utils** (Общие утилиты)
- **Назначение**: Переиспользуемые модули, типы, утилиты
- **Технологии**: TypeScript, npm пакет
- **Порт**: N/A (библиотека)

## Дополнительные зависимости

### Новые зависимости для микросервисной архитектуры:

#### Frontend Service:
- `express` (уже есть)
- `cors` (уже есть)
- `axios` — для HTTP запросов к API
- `dotenv` (уже есть)

#### API Service:
- `express` (уже есть)
- `cors` (уже есть)
- `helmet` — для безопасности
- `express-rate-limit` — для ограничения запросов
- `compression` — для сжатия ответов
- `dotenv` (уже есть)

#### Storage Service:
- `sqlite3` — для локальной разработки (локальные данные)
- `pg` — для PostgreSQL (Google Cloud SQL)
- `@google-cloud/firestore` — для хранения статей в Firestore (продакшн)
- `@google-cloud/storage` — для файлов в Google Cloud Storage (продакшн)
- `multer` (уже есть) — для загрузки файлов с клиента
- `fs-extra` (уже есть) — работа с файловой системой
- `dotenv` (уже есть) — выбор локального или облачного адаптера через переменные окружения (`STORAGE_MODE=local|cloud`)

#### Shared Utils:
- `dayjs` (уже есть)
- `uuid` (уже есть)
- `he` (уже есть)
- `jsdom` (уже есть)

## Изменения в ответственности компонентов

### Текущая структура → Новая структура:

#### Frontend Service:
- **Было**: `src/server/index.ts` (смешанные обязанности)
- **Стало**: `frontend/src/app.ts` (только рендеринг и статика)
- **Новые файлы**:
    - `frontend/src/routes/pages.ts` — маршруты страниц
    - `frontend/src/services/apiClient.ts` — клиент для API
    - `frontend/src/utils/templateEngine.ts` — движок шаблонов

#### API Service:
- **Было**: `src/server/routes/articles.ts` + `src/services/articleService.ts`
- **Стало**: `api/src/routes/articles.ts` + `api/src/controllers/articleController.ts`
- **Новые файлы**:
    - `api/src/middleware/validation.ts` — валидация
    - `api/src/middleware/errorHandler.ts` — обработка ошибок
    - `api/src/services/storageService.ts` — единый интерфейс для работы с хранилищем (через env выбирает адаптер)

#### Storage Service:
- **Было**: Прямая работа с JSON файлами
- **Стало**: Абстрактный слой с адаптерами, переключаемыми через env:
    - `STORAGE_MODE=local` → JSON + файловая система
    - `STORAGE_MODE=cloud` → Firestore + Cloud Storage
- **Новые файлы**:
    - `storage/src/adapters/jsonAdapter.ts` — JSON файлы (локально)
    - `storage/src/adapters/sqliteAdapter.ts` — SQLite (локально)
    - `storage/src/adapters/firestoreAdapter.ts` — Firestore (продакшн)
    - `storage/src/adapters/postgresAdapter.ts` — PostgreSQL (альтернативный вариант для продакшна)
    - `storage/src/adapters/fileSystemAdapter.ts` — локальные файлы
    - `storage/src/adapters/cloudStorageAdapter.ts` — Google Cloud Storage
    - `storage/src/services/storageService.ts` — точка входа, выбирающая адаптер по env

#### Shared Utils:
- **Было**: `src/utils/`, `src/types/`
- **Стало**: Отдельный пакет/модуль в монорепо
- **Новые файлы**:
    - `shared/src/types/` — все типы
    - `shared/src/utils/` — все утилиты
    - `shared/src/constants/` — константы


## Дерево-схема будущего проекта

```
frontend-learning/
├── docker-compose.yml
├── .env.example
│
├── frontend/
│   └── src/
│       ├── app.ts
│       ├── routes/pages.ts
│       └── utils/templateEngine.ts
│
├── api/
│   └── src/
│       ├── app.ts
│       ├── routes/articles.ts
│       └── services/storageClient.ts   # клиент для Storage Service
│
├── storage/
│   └── src/
│       ├── index.ts
│       ├── adapters/
│       │   ├── jsonAdapter.ts
│       │   ├── firestoreAdapter.ts
│       │   ├── fileSystemAdapter.ts
│       │   └── cloudStorageAdapter.ts
│       ├── services/
│       │   ├── storageService.ts
│       │   └── fileService.ts
│       └── interfaces/
│           ├── IStorageAdapter.ts
│           └── IFileAdapter.ts
│
├── shared/
│   └── src/
│       ├── types/Article.ts
│       └── utils/
│           └── validation.ts
│
└── data/   # только для локального режима
```

## Подробное описание компонентов

### 1. Frontend Service

**Технологии**: Express.js, TypeScript, HTML шаблоны  
**Порт**: 3000

**За что отвечает**:
- Server-side rendering HTML страниц
- Обслуживание статических файлов
- Рендеринг шаблонов с данными из API
- Обработка маршрутов страниц

**Связи с другими компонентами**:
- HTTP запросы к API Service для получения данных
- Использует Shared Utils для типов и утилит

**Ключевые файлы**:
- `app.ts` — настройка Express, middleware, маршруты
- `routes/pages.ts` — маршруты для страниц блога
- `services/apiClient.ts` — HTTP клиент для API
- `utils/templateEngine.ts` — рендеринг HTML шаблонов

---

### 2. API Service

**Технологии**: Express.js, TypeScript, OpenAPI/Swagger  
**Порт**: 3001

**За что отвечает**:
- REST API для работы с данными
- Валидация входящих данных
- Бизнес-логика приложения
- Документация API через Swagger

**Связи с другими компонентами**:
- HTTP запросы к Storage Service для работы с данными
- Использует Shared Utils для типов и валидации

**Ключевые файлы**:
- `app.ts` — настройка Express, middleware, CORS
- `routes/articles.ts` — API маршруты для статей
- `controllers/articleController.ts` — бизнес-логика
- `middleware/validation.ts` — валидация запросов
- `services/storageService.ts` — абстракция хранилища (работает через адаптеры)

---

### 3. Storage Service

**Технологии**: TypeScript, адаптеры для разных хранилищ  
**Порт**: Внутренний (не экспонируется)

**За что отвечает**:
- Единый интерфейс работы с данными (CRUD для статей и операции с файлами)
- Переключение между режимами по переменным окружения (`STORAGE_MODE=local|cloud`)
- Управление файлами (локально и в Google Cloud)
- Обеспечение консистентности данных

**Связи с другими компонентами**:
- Предоставляет HTTP API для API Service
- Использует Shared Utils для типов

**Ключевые файлы**:
- `index.ts` — HTTP сервер для внутреннего API
- `adapters/jsonAdapter.ts` — работа с JSON (локально)
- `adapters/firestoreAdapter.ts` — работа с Firestore (облако)
- `adapters/fileSystemAdapter.ts` — локальные файлы
- `adapters/cloudStorageAdapter.ts` — файлы в Google Cloud Storage
- `services/storageService.ts` — единый интерфейс для данных
- `services/fileService.ts` — единый интерфейс для файлов

---

### 4. Shared Utils

**Технологии**: TypeScript, npm пакет (или workspace-библиотека в монорепо)  
**Порт**: N/A (библиотека)

**За что отвечает**:
- Общие типы данных
- Переиспользуемые утилиты
- Константы приложения
- Валидация данных

**Связи с другими компонентами**:
- Используется всеми остальными сервисами как зависимость

**Ключевые файлы**:
- `types/Article.ts` — типы статей
- `utils/fileUtils.ts` — файловые операции
- `utils/renderUtils.ts` — утилиты рендеринга
- `constants/index.ts` — константы приложения

---

## Стратегия миграции данных

### Этап 1: Локальная разработка
- **Хранилище**: JSON файлы через `jsonAdapter`
- **Файлы**: локальная файловая система через `fileSystemAdapter`
- **Конфигурация**: `.env` (`STORAGE_MODE=local`)

### Этап 2: Google Cloud (продакшн)
- **Хранилище**: Firestore через `firestoreAdapter`
- **Файлы**: Google Cloud Storage через `cloudStorageAdapter`
- **Конфигурация**: переменные окружения в Cloud Run (`STORAGE_MODE=cloud`, ключи сервисных аккаунтов)

### Миграция данных:
1. **Скрипт миграции**: `scripts/migrate-to-firestore.ts`
2. **Перенос статей**: JSON → Firestore
3. **Перенос файлов**: Локальная папка → Cloud Storage
4. **Обновление путей**: Хранение в Firestore ссылок на файлы в Cloud Storage

## Docker Compose конфигурация

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://api:3001
    depends_on:
      - api

  api:
    build: ./api
    ports:
      - "3001:3001"
    environment:
      - STORAGE_URL=http://storage:3002
    depends_on:
      - storage

  storage:
    build: ./storage
    ports:
      - "3002:3002"
    environment:
      # Определяет поведение: локально (json + fs) или облако (firestore + gcs)
      - STORAGE_MODE=${STORAGE_MODE:-local}
      - LOCAL_DB_PATH=/app/data/articles.json
      - LOCAL_FILES_PATH=/app/data/days
      # Для облачного режима (STORAGE_MODE=cloud)
      - GCLOUD_PROJECT_ID=${GCLOUD_PROJECT_ID}
      - GCLOUD_CREDENTIALS=/app/keys/gcloud-key.json
      - FIRESTORE_COLLECTION=articles
      - GCS_BUCKET_NAME=${GCS_BUCKET_NAME}
    volumes:
      # Для локального режима
      - ./data:/app/data
        # Для cloud режима: только ключи (read-only)
      - ./keys:/app/keys:ro

```

## Преимущества предлагаемой архитектуры

### 1. **Модульность**
- Каждый сервис имеет чётко определённые обязанности
- Легко тестировать компоненты изолированно
- Простое добавление новых функций без изменения остального кода

### 2. **Масштабируемость**
- Возможность независимого масштабирования сервисов
- Горизонтальное масштабирование при необходимости
- Оптимизация ресурсов под нагрузку (например, масштабировать только API без фронта)

### 3. **Гибкость развертывания**
- Независимое развертывание сервисов
- Разные технологии для разных задач (Express, Firestore, Cloud Storage)
- Возможность A/B тестирования отдельных компонентов

### 4. **Удобство разработки**
- Параллельная разработка разных частей проекта
- Изоляция изменений через микросервисы
- Простая отладка и мониторинг благодаря разделению обязанностей

### 5. **Готовность к облаку**
- Лёгкая миграция в Google Cloud
- Использование Firestore и Cloud Storage через единый интерфейс
- Контейнеризация с Docker Compose и готовность к Kubernetes

---

## План поэтапной реализации

### Этап 1: Подготовка (1–2 дня)
1. Создание структуры папок
2. Настройка Docker Compose (с `STORAGE_MODE` в `.env`)
3. Выделение Shared Utils

### Этап 2: Storage Service (2–3 дня)
1. Создание адаптеров для JSON + файловой системы (локально)
2. Создание адаптеров для Firestore + Cloud Storage (облако)
3. HTTP API для Storage Service
4. Переключение между адаптерами через env (`STORAGE_MODE=local|cloud`)

### Этап 3: API Service (2–3 дня)
1. Выделение API логики
2. Настройка валидации и middleware
3. Интеграция с Storage Service (через его HTTP API)

### Этап 4: Frontend Service (1–2 дня)
1. Очистка от API логики
2. Настройка HTTP клиента для API
3. Обновление шаблонов и рендеринга

### Этап 5: Тестирование и оптимизация (1–2 дня)
1. Интеграционные тесты (локально и с `STORAGE_MODE=cloud`)
2. Настройка мониторинга и логирования
3. Документация для разработчиков и пользователей

---

## Заключение

Предлагаемая архитектура обеспечивает:
- **Простоту разработки** для учебного проекта
- **Готовность к масштабированию** при росте нагрузки
- **Лёгкую миграцию** в Google Cloud благодаря абстракции адаптеров
- **Сохранение прозрачности** для изучения и экспериментов

Архитектура следует принципам SOLID и лучшим практикам микро сервисной разработки, при этом остаётся достаточно простой для учебного проекта.

