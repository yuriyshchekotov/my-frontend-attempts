# Dockerfile для Frontend Service
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

# Возвращаемся в корень frontend
WORKDIR /app

# Копируем исходный код
COPY . .

# Собираем TypeScript
RUN npm run build

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S frontend -u 1001

RUN chown -R frontend:nodejs /app

USER frontend

EXPOSE 3000

CMD ["npm", "start"]
