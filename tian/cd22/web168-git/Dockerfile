# syntax=docker/dockerfile:1.3-labs
FROM alpine:3.16.2 AS busybox101
RUN apk --no-cache add busybox-extras curl git-daemon lighttpd && rm -rf /var/cache/apk/*

FROM public.ecr.aws/docker/library/alpine:3.17.0 AS k207-gitsrv
RUN apk --no-cache add busybox-extras curl git-daemon lighttpd git-gitweb perl-cgi