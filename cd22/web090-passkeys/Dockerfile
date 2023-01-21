# syntax=docker/dockerfile:1.3-labs
FROM denoland/deno:alpine-1.29.1 AS web090-passkeys101
WORKDIR /app
RUN <<EOOF
cat > deps.ts <<\EOOOF
import { Fido2Lib } from "https://deno.land/x/fido2@3.3.4/dist/main.js";
import express from 'npm:express@4.18.2';
import { base64 } from "https://deno.land/x/b64@1.1.25/src/base64.js";
EOOOF
deno cache deps.ts
EOOF

FROM denoland/deno:alpine-1.29.1 AS web090-passkeys103
WORKDIR /app
RUN <<EOOF
cat > deps.ts <<\EOOOF
import { Fido2Lib } from "https://deno.land/x/fido2@3.3.4/dist/main.js";
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { base64 } from "https://deno.land/x/b64@1.1.25/src/base64.js";
EOOOF
deno cache deps.ts
EOOF

FROM web090-passkeys103 AS web090-passkeys104
WORKDIR /app
RUN <<EOOF
cat >> deps.ts <<\EOOOF
import { Session } from "https://deno.land/x/oak_sessions@v4.0.6/mod.ts";
EOOOF
deno cache deps.ts
EOOF