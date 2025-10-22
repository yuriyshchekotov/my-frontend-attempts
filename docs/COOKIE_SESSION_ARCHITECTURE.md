# 🔐 Cookie-Based Session Авторизация (SSR)

## 📋 Обзор

Проект Frontend Learning использует **чистую SSR-архитектуру** с **cookie-based session авторизацией**. 

### Ключевые принципы:

✅ **JWT токен НИКОГДА не попадает в браузер** - хранится только в серверной сессии  
✅ **Браузер хранит только cookie `connect.sid`** - Express управляет сессиями автоматически  
✅ **Все формы обычные HTML** - без JavaScript, без fetch  
✅ **Все проверки авторизации на сервере** - через `req.session.user`  
✅ **API остаётся stateless** - работает по Bearer токенам от фронтенд-сервиса  
✅ **Нет клиентских скриптов авторизации** - auth-guard.js удалён  
✅ **Нет localStorage/sessionStorage** - не используется вообще  

---

## 🏗️ Архитектура

### Схема взаимодействия

```
Браузер                Frontend Service (SSR)              API Service (Stateless)
   |                          |                                    |
   | 1. POST /login           |                                    |
   |   (form submit)          |                                    |
   |------------------------->|                                    |
   |                          | 2. POST /auth/login                |
   |                          |    (email, password)               |
   |                          |----------------------------------->|
   |                          |                                    | 3. Проверка пароля
   |                          |                                    |    Создание JWT
   |                          | 4. { accessToken, user }          |
   |                          |<-----------------------------------|
   |                          | 5. Сохранение в сессии:           |
   |                          |    req.session.authToken = token  |
   |                          |    req.session.user = user        |
   |                          |                                    |
   | 6. Set-Cookie:           |                                    |
   |    connect.sid=...       |                                    |
   | 7. Redirect /my-blog     |                                    |
   |<-------------------------|                                    |
   |                          |                                    |
   | 8. GET /my-blog          |                                    |
   |    Cookie: connect.sid   |                                    |
   |------------------------->|                                    |
   |                          | 9. Восстановление сессии          |
   |                          |    из cookie connect.sid          |
   |                          | 10. Проверка req.session.user     |
   |                          | 11. GET /articles                  |
   |                          |     Authorization: Bearer token   |
   |                          |----------------------------------->|
   |                          |                                    | 12. Проверка JWT
   |                          |                                    |     Возврат статей
   |                          | 13. { articles }                   |
   |                          |<-----------------------------------|
   |                          | 14. Рендеринг HTML с данными      |
   | 15. HTML (my-blog.html)  |                                    |
   |<-------------------------|                                    |
```

---

## 🔄 Потоки авторизации

### 1. Регистрация

```
1. Пользователь заполняет <form method="POST" action="/registration">
2. Express: POST /registration → RegistrationRoutes.handleRegistration()
3. Фронтенд-сервис вызывает authClient.register(data) → API :3001/auth/register
4. API создаёт пользователя, хэширует пароль, возвращает { accessToken, user }
5. Фронтенд-сервис сохраняет:
   - req.session.authToken = accessToken
   - req.session.user = user
6. Express-session выставляет cookie connect.sid (автоматически)
7. Redirect на /my-blog
```

### 2. Логин

```
1. Пользователь заполняет <form method="POST" action="/login">
2. Express: POST /login → LoginRoutes.handleLogin()
3. Фронтенд-сервис вызывает authClient.login(data) → API :3001/auth/login
4. API проверяет пароль, создаёт JWT, возвращает { accessToken, user }
5. Фронтенд-сервис сохраняет в req.session:
   - authToken
   - user
6. Express выставляет cookie connect.sid
7. Redirect на /my-blog
```

### 3. Доступ к защищённой странице

```
1. Браузер запрашивает GET /my-blog (с cookie connect.sid)
2. express-session восстанавливает req.session из cookie
3. Middleware (app.ts) проверяет req.session.user → создаёт req.user
4. Маршрут проверяет:
   if (!req.user) → redirect /login
5. Если авторизован:
   - apiClient.setAuthToken(req.session.authToken)
   - Вызов API с токеном
   - Получение данных
   - res.render('my-blog.html', { user, articles, progressNotes })
```

### 4. Создание статьи

```
1. Пользователь заполняет <form method="POST" action="/articles">
2. Express: POST /articles → MyBlogRoutes.createArticle()
3. Маршрут проверяет req.user и req.session.authToken
4. apiClient.setAuthToken(req.session.authToken)
5. apiClient.createArticle(data) → API :3001/articles с Authorization: Bearer ...
6. API проверяет JWT, создаёт статью, возвращает данные
7. Redirect на /my-blog?success=...
```

### 5. Logout

```
1. Пользователь нажимает <form method="POST" action="/logout">
2. Express: POST /logout → LoginRoutes.handleLogout()
3. req.session.destroy() - очистка сессии на сервере
4. Cookie connect.sid удаляется/истекает автоматически
5. Redirect на /login
```

---

## 📁 Структура файлов

### Frontend Service (SSR)

```
frontend/src/
├── app.ts                      # Главный файл, настройка Express + session
├── routes/
│   ├── login.ts               # POST /login, POST /logout
│   ├── registration.ts        # POST /registration
│   ├── my-blog.ts             # GET /my-blog, POST /articles, POST /progress-notes
│   └── pages.ts               # GET / (blog)
├── services/
│   ├── authClient.ts          # Вызовы API для login/register (серверный)
│   └── apiClient.ts           # Вызовы API для статей/прогресса (серверный)
├── utils/
│   └── nunjucksEngine.ts      # Рендеринг Nunjucks шаблонов
└── public/
    ├── login.html             # Форма логина (обычная HTML форма)
    ├── registration.html      # Форма регистрации (обычная HTML форма)
    ├── my-blog.html           # Страница блога с табами
    ├── index.html             # Главная страница
    └── blog.html              # Публичный блог
```

### API Service (Stateless)

```
api/src/
├── app.ts                      # Главный файл API, БЕЗ express-session
├── routes/
│   ├── auth.routes.ts         # POST /auth/login, /auth/register
│   ├── articles.ts            # CRUD для статей (требует JWT)
│   └── progress.routes.ts     # CRUD для прогресса (требует JWT)
├── controllers/
│   ├── auth.controller.ts     # Логика login/register, создание JWT
│   ├── articleController.ts   # Логика работы со статьями
│   └── progressController.ts  # Логика работы с прогрессом
├── middleware/
│   └── auth.middleware.ts     # Проверка JWT из заголовка Authorization
└── services/
    ├── jwt.service.ts         # Создание и проверка JWT
    └── usersService.ts        # Работа с пользователями
```

---

## 🔧 Конфигурация

### Переменные окружения (.env)

```bash
# Frontend Service
FRONTEND_PORT=3000
SESSION_SECRET=your-super-secret-session-key-change-in-production

# API Service
API_PORT=3001
JWT_ACCESS_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES=24h

# URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001
STORAGE_URL=http://localhost:3002
```

### Express Session (frontend/src/app.ts)

```typescript
app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,        // true в production для HTTPS
    httpOnly: true,       // защита от XSS
    maxAge: 24 * 60 * 60 * 1000  // 24 часа
  }
}));
```

---

## 🛡️ Безопасность

### Что защищает архитектуру:

1. **JWT токен в серверной сессии**
   - Браузер никогда не видит токен
   - Невозможно украсть через XSS
   - Невозможно подделать без доступа к серверу

2. **HttpOnly cookie**
   - JavaScript не может прочитать cookie
   - Защита от XSS атак

3. **SameSite cookie** (можно добавить)
   - Защита от CSRF атак
   ```typescript
   cookie: {
     sameSite: 'lax'  // или 'strict'
   }
   ```

4. **Stateless API**
   - API не хранит сессии
   - Масштабируемость
   - JWT проверяется на каждом запросе

5. **Серверная валидация**
   - Все проверки на сервере
   - Клиент не может обойти проверки

---

## 📝 Middleware

### Frontend Service (frontend/src/app.ts)

```typescript
// Middleware для проверки авторизации (SSR)
app.use((req, res, next) => {
  // Проверяем наличие пользователя в сессии
  if (req.session?.user && req.session?.authToken) {
    // Создаём req.user для совместимости с маршрутами
    req.user = {
      sub: req.session.user.id,
      name: req.session.user.name,
      role: req.session.user.role,
      iat: 0,
      exp: 0
    };
  } else {
    req.user = undefined;
  }
  
  next();
});

// Middleware для передачи данных пользователя в шаблоны
app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  next();
});
```

### API Service (api/src/middleware/auth.middleware.ts)

```typescript
authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Access token required' });
    return;
  }

  const token = authHeader.substring(7);
  const payload = this.jwtService.verifyAccess(token);
  req.user = payload;
  next();
};
```

---

## 🧪 Проверка работы

### 1. Проверка авторизации

```bash
# Открыть браузер
1. Перейти на http://localhost:3000
2. Открыть DevTools → Application → Cookies
3. Должна быть только cookie: connect.sid
4. НЕ должно быть: authToken, auth_data, user в localStorage

# Попытка доступа без авторизации
1. Перейти на http://localhost:3000/my-blog
2. Должен быть redirect на /login?error=...
```

### 2. Тест регистрации

```bash
1. Перейти на /registration
2. Заполнить форму (email или name + password)
3. Нажать "Зарегистрироваться"
4. Должен быть redirect на /my-blog
5. Проверить cookie connect.sid в DevTools
```

### 3. Тест логина

```bash
1. Перейти на /login
2. Ввести данные
3. Нажать "Войти"
4. Должен быть redirect на /my-blog
5. Страница должна показать имя пользователя
```

### 4. Тест создания статьи

```bash
1. На странице /my-blog
2. Перейти на таб "Создать статью"
3. Заполнить форму
4. Нажать "Создать статью"
5. Должен быть redirect на /my-blog?success=...
6. Статья должна появиться в списке
```

### 5. Тест logout

```bash
1. На странице /my-blog
2. Нажать "Выйти"
3. Должен быть redirect на /login
4. Cookie connect.sid должна исчезнуть
5. При попытке открыть /my-blog → redirect на /login
```

---

## 🚀 Преимущества SSR + Cookie-Based

### По сравнению с SPA + localStorage:

| Критерий | SSR + Cookie | SPA + localStorage |
|----------|--------------|-------------------|
| **Безопасность** | ✅ Высокая | ⚠️ Уязвима к XSS |
| **JWT в браузере** | ✅ Нет | ❌ Да |
| **SEO** | ✅ Отлично | ⚠️ Требует SSR |
| **Производительность** | ✅ Быстрая первая загрузка | ⚠️ Медленная первая загрузка |
| **Сложность** | ✅ Простая | ⚠️ Сложная |
| **Клиентский JS** | ✅ Минимум | ❌ Много |

---

## 🔍 Отличия от предыдущей архитектуры

### Что БЫЛО (SPA + localStorage):

❌ JWT токен хранился в localStorage  
❌ Клиентский JavaScript делал fetch запросы к API  
❌ AuthGuard.js проверял авторизацию в браузере  
❌ Формы отправлялись через fetch с JavaScript  
❌ Токен передавался в каждом запросе из браузера  

### Что СТАЛО (SSR + Cookie):

✅ JWT токен хранится в серверной сессии  
✅ HTML формы отправляются на фронтенд-сервис  
✅ Авторизация проверяется на сервере через req.session  
✅ Браузер хранит только cookie connect.sid  
✅ Токен передаётся только между фронтенд-сервисом и API  

---

## 📚 Дополнительные материалы

- [Express Session Documentation](https://github.com/expressjs/session)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)

---

**Дата создания:** 2025-10-21  
**Версия:** 1.0  
**Статус:** ✅ Реализовано


