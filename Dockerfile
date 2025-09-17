FROM nginx:alpine

COPY mock.html /usr/share/nginx/html/index.html

RUN sed -i 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf
