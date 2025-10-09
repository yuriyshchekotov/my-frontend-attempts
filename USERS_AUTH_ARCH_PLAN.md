# 🧭 Архитектура и требования: Авторизация V1

## 🎯 Цели релиза

- Отличать пользователей и ограничивать доступ к API
- Пускать на сайт только авторизованных (редирект на `/login`)
- Привязать `articles` и `progress` к `user_id` (логическая многотенантность)
- На главной странице (а затем на `/my-blog`) показывать **только свой контент**
- Операции с `progress-notes` — только со “своими”
- Поддержка ролей `student` и `admin`
- Админ может создавать пользователей через API и видеть всё
- Готовность к миграции c локального JSON в Firestore + GCS **без смены контрактов**

---

## 🧱 Данные и модели

### 1. `User` (shared)

```ts
export interface User {
  id: number;              // автоинкремент (локально) или sequence в Firestore
  email?: string;          // необязательный
  name: string;            // обязателен (если нет, генерировать из email до '@')
  passwordHash: string;    // bcrypt
  role: 'student' | 'admin'; // по умолчанию 'student'
  createdAt: string;       // ISO
  updatedAt: string;       // ISO
}
```
- Локально: автоинкремент в users.json
- В Firestore: sequence-счётчик в counters/users для числового id

### Article (улучшенная, предполагающая разбиение по юзерам)

```ts
export interface Article {
    id: number;
    user_id: number;          // владелец
    date: string;
    title: string;
    text: string | null;
    screenshot: string | null; // user-aware путь
    source: string | null;     // user-aware путь
    content: string | null;
}
```

### ProgressNote (улучшенная, предполагающая разбиение по юзерам)

```ts
export interface ProgressNote {
    id: number;
    user_id: number;  // владелец записи
    date: string;     // ISO
    text: string;     // содержимое
}
```

### AuthTokenPayload (shared)

```ts
export interface AuthTokenPayload {
    sub: number;                  // user id
    name: string;
    role: 'student' | 'admin';
    iat?: number;
    exp?: number;
}
```
## 💾 Хранение данных

### Локальный режим (STORAGE_MODE=local)

- users.json — новый файл рядом с articles.json и progress.json
- Многотенантность через user_id
- Файлы (.png, .html) хранятся с учётом пользователя

#### Пример структуры:

```
storage/data/
├─ users.json
├─ articles.json
├─ progress.json
└─ user/
└─ 1/days/day-01/screenshot.png
```
- FileKey: user/{userId}/days/day-XX/...

FileKey: user/{userId}/days/day-XX/...

### Облачный режим (Firestore + GCS)

- Коллекции: users, articles, progress
- У статей и прогресса — обязательный user_id
- Коллекция counters для числовых id
- В GCS те же ключи: user/{userId}/days/...

#### Принцип:
- JSON / Firestore — не делятся физически по пользователям
- Файлы — делятся по префиксу user/{id}/

## 🔐 Безопасность

- Пароли — bcrypt (saltRounds=10–12)
- Авторизация через JWT:
- - ACCESS_TOKEN (15 минут)
- - (опционально) REFRESH_TOKEN (7 дней, в V1.1)
- Передача: Authorization: Bearer <token>
- Валидация входных данных — через zod
- Rate Limit на /auth/*

### ENV для JWT

``` dotenv
JWT_ACCESS_SECRET=dev_secret_change_me
JWT_ACCESS_EXPIRES=15m
# (V1.1)
JWT_REFRESH_SECRET=dev_refresh_change_me
JWT_REFRESH_EXPIRES=7d
```

## 🧩 API: маршруты и правила

### 1. Auth

#### POST /auth/login
Вход по email или name

{
"email": "user@example.com",
"password": "mypassword"
}

Приоритет логина по email  
Если email не указан — вход по name

**Ответ 200:**

{
"accessToken": "jwt...",
"user": { "id": 1, "name": "student1", "role": "student" }
}

---

#### POST /auth/register
Регистрация нового пользователя

{
"email": "user@example.com",
"name": "student1",
"password": "123456",
"confirmPassword": "123456"
}

Если name пуст — генерируется из email  
Роль по умолчанию — student

---

### 2. Users (admin only)

#### POST /users
Создать пользователя

{ "email": "user@example.com", "name": "newuser", "password": "123456", "role": "student" }

#### GET /users
Возвращает всех пользователей (с фильтрацией позже)

#### PATCH /users/:id, DELETE /users/:id
Доступно только админу

---

### 3. Articles

#### GET /articles
admin → все статьи (?user_id= поддерживается)  
student → только свои

#### POST /articles
Автоматически проставляет user_id = currentUser.id

#### PATCH, DELETE
student → только свои  
admin → любые

---

### 4. Progress

#### GET /progress
student → свои  
admin → все (?user_id= фильтр)

#### POST /progress
user_id = currentUser.id

#### PATCH / DELETE
Только владелец или админ

---

## 💻 Frontend

### Маршруты
````
| Маршрут | Назначение |
|----------|-------------|
| `/login` | Вход по email/name + пароль |
| `/registration` | Регистрация нового пользователя |
| `/` | Редирект на `/my-blog`, если авторизован |
| `/my-blog` | Отображает статьи текущего пользователя |
````

### Поведение

- Токен хранится в localStorage
- Все запросы → `Authorization: Bearer <token>`
- На 401 → редирект на `/login`

---

## ⚙️ Миддлвары и сервисы (API)

````
| Название | Назначение |
|-----------|-------------|
| authMiddleware | Валидирует JWT, добавляет req.user |
| requireAuth | 401, если не авторизован |
| requireRole(role) | Проверяет роль |
| ownershipGuard | Проверяет, что запись принадлежит пользователю |
| validateBody(schema) | Проверка тела запроса через Zod |
| jwtService.signAccess(payload) | Генерация токена |
| jwtService.verifyAccess(token) | Проверка токена |
````

## 🧮 Zod-схемы

### Регистрация

````ts
const RegisterSchema = z.object({
email: z.string().email().optional(),
name: z.string().min(2).optional(),
password: z.string().min(6),
confirmPassword: z.string().min(6),
}).refine(d => d.password === d.confirmPassword, {
message: 'Passwords mismatch',
path: ['confirmPassword'],
});
````

### Логин

````ts
const LoginSchema = z.object({
email: z.string().email().optional(),
name: z.string().min(2).optional(),
password: z.string().min(6),
}).refine(d => !!d.email || !!d.name, {
message: 'Provide email or name',
});
````


## 🧭 Миграции и совместимость

Создать админа (seed):  
Если users.json пуст →  
id=1, name='admin', role='admin', passwordHash=bcrypt('admin123')

Добавить user_id в старые статьи и прогресс:  
user_id = 1

Переложить файлы → user/1/...  
Обновить пути в articles.json

На фронте — редирект до логина, `/my-blog` отображает только свои записи

---

## 🌿 Новая структура проекта
````
project-root/  
├─ shared/  
│   ├─ src/  
│   │   ├─ types/  
│   │   │   ├─ user.ts  
│   │   │   ├─ article.ts  
│   │   │   └─ progress.ts  
│   │   └─ utils/  
│   │       └─ auth.ts  
│   └─ package.json  
│  
├─ api/  
│   ├─ src/  
│   │   ├─ routes/  
│   │   │   ├─ auth.routes.ts  
│   │   │   ├─ users.routes.ts  
│   │   │   ├─ articles.routes.ts  
│   │   │   └─ progress.routes.ts  
│   │   ├─ controllers/  
│   │   ├─ services/  
│   │   ├─ middleware/  
│   │   └─ schemas/  
│   └─ package.json  
│  
├─ frontend/  
│   ├─ src/  
│   │   ├─ routes/  
│   │   │   ├─ login.ts  
│   │   │   ├─ registration.ts  
│   │   │   ├─ index.ts  
│   │   │   └─ my-blog.ts  
│   │   ├─ services/  
│   │   ├─ utils/  
│   │   └─ public/  
│   └─ package.json  
│  
├─ storage/  
│   ├─ data/  
│   │   ├─ users.json  
│   │   ├─ articles.json  
│   │   ├─ progress.json  
│   │   └─ user/1/days/...  
│   ├─ src/  
│   │   ├─ adapters/  
│   │   ├─ services/  
│   │   └─ interfaces/  
│   └─ scripts/seed.ts  
│  
├─ legacy/  
│   └─ ...  
├─ openapi.yml  
└─ package.json
````

## 🔒 Поведение и правила доступа

- **Auth:** JWT обязателен для всех маршрутов, кроме `/auth/*` и страниц `/login`, `/registration`
- **Articles/Progress (student):** видит/меняет только свои
- **Articles/Progress (admin):** видит/меняет всё (`?user_id=` фильтр)
- **Files:** API проверяет принадлежность файлов пользователю (`user/{id}/...`)

---

## 🪞 Минимальный UI

### /login
- Email или name + пароль
- Кнопка **Войти**
- Ссылка **Регистрация**

### /registration
- Email (опционально), name (опционально)
- Пароль + подтверждение
- Если name пуст — генерируется из email

### /my-blog
- Отображает статьи текущего пользователя

---

## ✅ Тест-кейсы ядра

- Регистрация без email, но с name → ✅
- Регистрация с email без name → name = до `@`
- Вход по email / name → токен с ролью
- Студент не видит чужие статьи/прогресс
- Админ видит всех (`?user_id` работает)
- Ошибки валидации → 400
- Неверный префикс файла → отклонено
- После миграции старые записи → `user_id=1`

---

## 🕓 Отложено на V1.1

- Refresh-токены (`POST /auth/refresh`)
- Публичные блоги `/u/:name`
- Поиск `/users?search=`
- Ротация JWT-ключей

---

## 🚀 План внедрения

1. Добавить модели и типы в `shared`
2. Реализовать `auth` и `users` в `api`
3. Обновить `articles` и `progress` маршруты
4. Добавить `users.store.ts` и `files.store.ts` в `storage`
5. Миграция данных (`user_id=1`, перенос файлов)
6. Обновить фронт (`/login`, `/registration`, `authGuard`)
7. Обновить `openapi.yml`