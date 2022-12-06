# syntax=docker/dockerfile:1.3-labs
# 6MB
FROM alpine:3.16.2 AS busybox101
RUN apk --no-cache add busybox-extras curl git-daemon lighttpd && rm -rf /var/cache/apk/*