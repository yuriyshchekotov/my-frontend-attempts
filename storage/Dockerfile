# Dockerfile для Storage Service
FROM node:18-alpine

WORKDIR /app

# Устанавливаем зависимости для сборки
RUN apk add --no-cache python3 make g++

# Копируем package.json и устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm ci

# Копируем shared как зависимость
COPY ../shared ./shared
WORKDIR /app/shared
RUN npm ci && npm run build

# Возвращаемся в корень storage
WORKDIR /app

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S storage -u 1001

# Создаем директории для данных
RUN mkdir -p /app/data /app/keys
RUN chown -R storage:nodejs /app

USER storage

EXPOSE 3002

CMD ["npm", "start"]
