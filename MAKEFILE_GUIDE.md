# 🔧 Makefile Guide - Обновленная система авторизации

## 🚀 Быстрый старт

### Первый запуск
```bash
# Полная настройка с авторизацией
make dev-auth
```

### Обычный запуск
```bash
# Если уже настроено
make dev
```

## 📋 Основные команды

### 🔐 Авторизация
```bash
make seed        # Создать пользователей по умолчанию
make auth-setup  # Полная настройка авторизации
make auth-test   # Тестирование API авторизации
```

### 🚀 Разработка
```bash
make dev         # Запуск в режиме разработки
make dev-auth    # Быстрый старт с настройкой авторизации
make start       # Запуск в production режиме
```

### 📦 Сборка
```bash
make install     # Установка зависимостей
make build       # Сборка всех сервисов
make clean       # Очистка артефактов
make reset       # Полный сброс
```

### 🔍 Мониторинг
```bash
make health      # Проверка здоровья сервисов
make help        # Справка по командам
```

## 🎯 Сценарии использования

### 1. Первый запуск проекта
```bash
# Клонирование и настройка
git clone <repo>
cd frontend-learning
make dev-auth
```

### 2. Ежедневная разработка
```bash
# Запуск сервисов
make dev

# Проверка здоровья
make health

# Тестирование авторизации
make auth-test
```

### 3. Production развертывание
```bash
# Сборка и запуск
make start
```

### 4. Отладка проблем
```bash
# Полный сброс
make reset

# Пересборка с авторизацией
make auth-setup
make dev
```

## 🔐 Пользователи по умолчанию

После выполнения `make seed` или `make auth-setup`:

- **Администратор**: `admin` / `admin123`
- **Студент**: `student1` / `student123`

## 🌐 Доступные сервисы

После запуска `make dev`:

- **Frontend**: http://localhost:3000 (с авторизацией)
- **API**: http://localhost:3001 (с auth endpoints)
- **Storage**: http://localhost:3002
- **API Docs**: http://localhost:3001/api-docs

## 🧪 Тестирование

### Автоматическое тестирование
```bash
make auth-test
```

### Ручное тестирование
```bash
# Регистрация
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"test123","confirmPassword":"test123"}'

# Вход
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"admin","password":"admin123"}'

# Защищенный endpoint
curl -X GET http://localhost:3001/articles \
  -H "Authorization: Bearer <token>"
```

## 🚨 Устранение проблем

### Сервисы не запускаются
```bash
make clean
make install
make build
make dev
```

### Проблемы с авторизацией
```bash
make seed
make auth-test
```

### Проблемы с зависимостями
```bash
make reset
```

## 📝 Логи и отладка

```bash
# Просмотр логов
yarn log

# Проверка конкретного сервиса
curl http://localhost:3000/health  # Frontend
curl http://localhost:3001/health  # API
curl http://localhost:3002/health  # Storage
```

## 🔄 Обновление

```bash
# Обновление зависимостей
make clean
make install
make build

# Перезапуск с новой версией
make dev
```


