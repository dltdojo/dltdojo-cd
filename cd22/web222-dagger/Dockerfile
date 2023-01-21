FROM node:18.12.1-alpine3.16
RUN apk update \
    && apk add shadow docker-cli \
    && rm -rf /var/cache/apk/*
RUN addgroup -S docker && adduser node docker
WORKDIR /app