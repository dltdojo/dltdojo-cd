# syntax=docker/dockerfile:1.3-labs
# 6MB
FROM alpine:3.16.2 AS busybox101
RUN apk --no-cache add busybox-extras

# 6MB
FROM busybox101 AS netcat101
RUN apk --no-cache add netcat-openbsd

# 8MB
FROM busybox101 AS sqlite101
RUN apk --no-cache add sqlite

# 29MB
FROM busybox101 AS tinytools101
RUN apk --no-cache add curl bind-tools netcat-openbsd fish jq coreutils

# 121MB
FROM denoland/deno:alpine-1.27.2 AS deno101
WORKDIR /app
RUN <<EOOF
cat > deps.ts <<\EOOOF
export { serve } from "https://deno.land/std@0.163.0/http/server.ts";
EOOOF
deno cache deps.ts
EOOF

# 123MB
FROM denoland/deno:alpine-1.27.2 AS deno102
WORKDIR /app
RUN <<EOOF
cat > deps.ts <<\EOOOF
export { serve } from "https://deno.land/std@0.163.0/http/server.ts";
export * as encyaml from "https://deno.land/std@0.163.0/encoding/yaml.ts";
export * as enchex from "https://deno.land/std@0.163.0/encoding/hex.ts";
export { DB } from "https://deno.land/x/sqlite@v3.7.0/mod.ts";
EOOOF
deno cache deps.ts
EOOF

# 150MB
FROM deno102 AS deno103
WORKDIR /app
RUN apk --no-cache add busybox-extras curl bind-tools netcat-openbsd fish jq coreutils