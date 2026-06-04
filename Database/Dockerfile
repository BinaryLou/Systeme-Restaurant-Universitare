FROM mysql:8.0

ENV MYSQL_DATABASE=ru_digital

COPY ./schema.sql /docker-entrypoint-initdb.d/1-schema.sql
COPY ./seed.sql /docker-entrypoint-initdb.d/2-seed.sql
