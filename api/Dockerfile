# Dockerfile для API Service
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

# Возвращаемся в корень api
WORKDIR /app

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S api -u 1001

RUN chown -R api:nodejs /app

USER api

EXPOSE 3001

CMD ["npm", "start"]
