# 🔧 Исправление конфликта портов в make dev

## 🚨 Проблема

При запуске `make dev` возникала ошибка:
```
Error: listen EADDRINUSE: address already in use :::3002
```

## 🔍 Причина

Проблема была в том, что storage сервис запускался **дважды**:

1. **Первый раз** - при импорте `UsersStore` из `@frontend-learning/storage` в API сервисе
2. **Второй раз** - как отдельный сервис через `yarn workspace @frontend-learning/storage dev`

Это происходило потому, что в `storage/src/index.ts` был код запуска сервера, который выполнялся при импорте модуля.

## ✅ Решение

### 1. Разделение кода

Создал отдельный файл `storage/src/server.ts` для запуска сервера:

```typescript
// storage/src/server.ts - код запуска сервера
import express from 'express';
// ... весь код сервера
app.listen(PORT, () => {
  console.log(`🚀 Storage Service running on port ${PORT}`);
});
```

### 2. Обновление index.ts

Изменил `storage/src/index.ts` на чистые экспорты:

```typescript
// storage/src/index.ts - только экспорты
export { StorageService } from './services/storageService';
export { FileService } from './services/fileService';
export { ProgressService } from './services/progressService';
export { UsersStore } from './services/users.store';
```

### 3. Обновление package.json

Изменил скрипты в `storage/package.json`:

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "start": "node dist/server.js"
  }
}
```

## 🧪 Тестирование

После исправлений команда `make dev` работает корректно:

```bash
make dev
```

Результат:
- ✅ **Frontend**: http://localhost:3000 - работает
- ✅ **API**: http://localhost:3001 - работает  
- ✅ **Storage**: http://localhost:3002 - работает
- ✅ **Нет конфликтов портов**

## 📋 Проверка здоровья сервисов

```bash
# Frontend
curl http://localhost:3000/health

# API  
curl http://localhost:3001/health

# Storage
curl http://localhost:3002/health
```

Все сервисы отвечают корректно.

## 🎯 Результат

- ✅ **Исправлен конфликт портов**
- ✅ **Storage сервис запускается только один раз**
- ✅ **API может импортировать UsersStore без запуска сервера**
- ✅ **Команда make dev работает корректно**

## 📝 Принцип решения

**Разделение ответственности**:
- `index.ts` - только экспорты для импорта другими сервисами
- `server.ts` - код запуска сервера для development/production

Это стандартная практика для библиотек и сервисов в Node.js.

