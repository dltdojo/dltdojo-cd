# syntax=docker/dockerfile:1.3-labs
FROM busybox:1.35.0 AS opa101
COPY --from=openpolicyagent/opa:0.46.1-static /opa /bin/opa


# 121MB
FROM denoland/deno:alpine-1.27.2 AS deno101
WORKDIR /app
RUN <<EOOF
cat > deps.ts <<\EOOOF
import { serve } from "https://deno.land/std@0.163.0/http/server.ts";
import chai from "https://esm.sh/chai@4.3.6";
import opa  from "https://unpkg.com/@open-policy-agent/opa-wasm@1.8.0/dist/opa-wasm-browser.esm.js";
chai.config.truncateThreshold = 0;
export { chai, opa , serve } ;
EOOOF
deno cache deps.ts
EOOF

# 150MB
FROM deno101 AS deno102
WORKDIR /app
RUN apk --no-cache add busybox-extras curl bind-tools netcat-openbsd fish jq coreutils