# syntax=docker/dockerfile:1.3-labs
FROM alpine:3.16.2 AS busybox101
RUN apk --no-cache add busybox-extras curl git-daemon lighttpd && rm -rf /var/cache/apk/*

FROM public.ecr.aws/docker/library/alpine:3.17.0 AS k207-gitsrv
RUN apk --no-cache add busybox-extras curl git-daemon lighttpd git-gitweb perl-cgi

FROM denoland/deno:alpine-1.29.1 AS web168-git104
WORKDIR /app
RUN apk --no-cache add busybox-extras curl git-daemon lighttpd git-gitweb perl-cgi
RUN <<EOOF
deno run -A - <<ENND
import "https://deno.land/std@0.170.0/http/server.ts";
ENND
EOOF

FROM golang:1.19.4-alpine3.17 AS web168-git105-build
WORKDIR /app
RUN go install github.com/asim/git-http-backend@v0.3.0

FROM public.ecr.aws/docker/library/alpine:3.17.0 AS web168-git105
WORKDIR /app
RUN apk --no-cache add busybox-extras curl lighttpd git-gitweb perl-cgi
COPY --from=web168-git105-build /go/bin/git-http-backend /usr/local/bin/go-git-http-backend

FROM public.ecr.aws/docker/library/alpine:3.15.6 AS web168-git106
WORKDIR /app
RUN <<"ENND"
echo https://mirror.sr.ht/alpine/v3.15/sr.ht >> /etc/apk/repositories
wget -q -O /etc/apk/keys/alpine@sr.ht.rsa.pub https://mirror.sr.ht/alpine/alpine@sr.ht.rsa.pub
apk update
apk add git.sr.ht meta.sr.ht
ENND