FROM alpine:3.17
RUN apk update && apk add shadow docker-cli-compose \
    && rm -rf /var/cache/apk/*
RUN addgroup -S docker
WORKDIR /app