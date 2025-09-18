# Training Blog

Учебный проект "Training Blog" на TypeScript + Express для изучения веб-разработки.

## Описание

Проект представляет собой блог, который умеет:
- Хранить статьи в `data/articles.json`
- Отдавать их через REST API
- Рендерить HTML-блог на основе семантического шаблона
- Предоставлять Swagger UI для документации API

## Структура проекта

```
project-root/
├─ data/
│   ├─ days/                    # Примеры HTML файлов
│   │   └─ day-02/semantic.html # Семантический шаблон
│   └─ articles.json            # База статей
├─ src/
│   ├─ server/
│   │   ├─ index.ts            # Основной сервер
│   │   └─ routes/articles.ts  # API routes для статей
│   ├─ templates/
│   │   └─ blog.html           # HTML шаблон блога
│   ├─ types/
│   │   └─ Article.ts          # TypeScript типы
│   ├─ services/
│   │   └─ articleService.ts   # Бизнес-логика статей
│   └─ utils/
│       ├─ fileUtils.ts        # Утилиты для работы с файлами
│       └─ renderUtils.ts      # Утилиты для рендеринга HTML
├─ package.json
├─ tsconfig.json
└─ openapi.yml                 # OpenAPI спецификация
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

1. **Установка зависимостей:**
   ```bash
   yarn install
   ```

2. **Запуск в режиме разработки:**
   ```bash
   yarn dev
   ```

3. **Сборка проекта:**
   ```bash
   yarn build
   ```

4. **Запуск продакшн версии:**
   ```bash
   yarn start
   ```

## Доступные URL

После запуска сервера доступны следующие адреса:

- **Главная страница блога:** http://localhost:3000/
- **API документация (Swagger UI):** http://localhost:3000/api-docs
- **API статей:** http://localhost:3000/articles
- **Статические файлы:** http://localhost:3000/data/...

## Технологии

- **TypeScript** - типизированный JavaScript
- **Express.js** - веб-фреймворк для Node.js
- **fs-extra** - расширенные возможности работы с файловой системой
- **he** - HTML entity encoding/decoding
- **swagger-ui-dist** - Swagger UI для документации API
- **tsx** - TypeScript execution engine для разработки

## Особенности реализации

1. **Валидация файлов:** Проверка существования и расширений файлов
2. **HTML экранирование:** Безопасное отображение HTML контента
3. **Автоинкремент ID:** Автоматическая генерация уникальных ID
4. **Семантический HTML:** Использование правильных HTML тегов
5. **Обработка ошибок:** Корректные HTTP статус коды и сообщения
6. **Swagger UI:** Интерактивная документация API

## Примеры использования

### Создание статьи с текстом
```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Новая статья",
    "text": "Содержимое статьи"
  }'
```

### Создание статьи с скриншотом
```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Статья со скриншотом",
    "text": "Описание",
    "screenshot": "days/day-01/screenshot.png"
  }'
```

### Создание статьи с исходным кодом
```bash
curl -X POST http://localhost:3000/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Статья с кодом",
    "text": "Описание урока",
    "source": "days/day-02/semantic.html"
  }'
```

## Лицензия

Учебный проект для изучения веб-разработки.

