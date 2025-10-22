# 🔨 Правильная последовательность сборки проекта

## 📋 Определенная последовательность

После тестирования была определена точная последовательность сборки проекта:

### 1. **Shared** (первый)
```bash
cd shared && rm -rf dist tsconfig.tsbuildinfo && yarn build
```
- Должен собираться первым, так как от него зависят все остальные сервисы
- Содержит общие типы, интерфейсы и утилиты

### 2. **Storage** (второй)
```bash
cd storage && rm -rf dist tsconfig.tsbuildinfo && yarn build
```
- Зависит от shared
- Предоставляет UsersStore для API

### 3. **API** (третий)
```bash
cd api && rm -rf dist tsconfig.tsbuildinfo && yarn build
```
- Зависит от shared и storage
- Импортирует UsersStore из storage

### 4. **Frontend** (четвертый)
```bash
cd frontend && rm -rf dist tsconfig.tsbuildinfo && yarn build
```
- Зависит от shared
- Использует типы из shared

## 🚫 Неправильные последовательности

### ❌ Неправильно:
- Сборка storage до shared
- Сборка api до storage
- Параллельная сборка всех сервисов

### ✅ Правильно:
- Строго последовательная сборка в указанном порядке
- Очистка dist и tsconfig.tsbuildinfo перед каждой сборкой

## 🔧 Команда reset в Makefile

Обновленная команда `make reset` теперь выполняет правильную последовательность:

```makefile
reset: clean install
	@echo "🔨 Building with correct sequence..."
	@echo "Building shared package first..."
	@cd shared && rm -rf dist tsconfig.tsbuildinfo && yarn build && cd ..
	@echo "Building storage package..."
	@cd storage && rm -rf dist tsconfig.tsbuildinfo && yarn build && cd ..
	@echo "Building api package..."
	@cd api && rm -rf dist tsconfig.tsbuildinfo && yarn build && cd ..
	@echo "Building frontend package..."
	@cd frontend && rm -rf dist tsconfig.tsbuildinfo && yarn build && cd ..
	@echo "✨ Full reset complete!"
```

## 🧪 Тестирование

Команда была протестирована и работает корректно:

```bash
make reset
```

Выполняет:
1. ✅ Очистку всех артефактов (`make clean`)
2. ✅ Установку зависимостей (`yarn install`)
3. ✅ Сборку shared
4. ✅ Сборку storage
5. ✅ Сборку api
6. ✅ Сборку frontend

## 📝 Примечания

- **Важно**: Каждый сервис должен очищать свои dist и tsconfig.tsbuildinfo перед сборкой
- **Зависимости**: Строго соблюдать порядок сборки
- **Ошибки**: При ошибках сборки проверять, что предыдущие сервисы собраны корректно

## 🚀 Использование

Для полной пересборки проекта используйте:

```bash
make reset
```

Эта команда гарантированно соберет проект в правильной последовательности.

