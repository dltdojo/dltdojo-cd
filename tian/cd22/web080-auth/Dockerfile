# syntax=docker/dockerfile:1.3-labs
FROM denoland/deno:alpine-1.29.1 AS web080-authn101
WORKDIR /app
RUN <<EOOF
cat > deps.ts <<\EOOOF
import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions@v4.0.6/mod.ts";
EOOOF
deno cache deps.ts
EOOF

FROM denoland/deno:alpine-1.29.1 AS web080-authn105
WORKDIR /app
RUN <<EOOF
deno run -A - <<END
import "https://deno.land/std@0.170.0/http/server.ts";
import "https://deno.land/std@0.170.0/http/mod.ts";
import "https://deno.land/x/rutt@0.0.14/mod.ts";
import "https://esm.sh/preact@10.5.15";
import "https://esm.sh/preact-render-to-string@5.1.19?deps=preact@10.5.15";
import "https://deno.land/x/djwt@v2.8/mod.ts";
END
EOOF