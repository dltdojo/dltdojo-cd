# syntax=docker/dockerfile:1.3-labs
FROM denoland/deno:alpine-1.29.1 AS web105-102
WORKDIR /app
RUN <<EOOF
cat > deps.ts <<\EOOOF
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
EOOOF
deno cache deps.ts
EOOF