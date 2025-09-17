# Базовый образ с простым nginx
FROM nginx:alpine

# Копируем файл в стандартную папку nginx
COPY mock.html /usr/share/nginx/html/index.html

# Nginx уже слушает порт 80, Cloud Run подхватит его как $PORT
