# syntax=docker/dockerfile:1.3-labs
FROM denoland/deno:alpine-1.29.1
WORKDIR /app
RUN <<EOF
cd /tmp
deno run -A - <<"ENND" > import_map.json
import { freshImports, twindImports } from "https://deno.land/x/fresh@1.1.2/src/dev/imports.ts";
const importMap = { imports: {} as Record<string, string> };
freshImports(importMap.imports);
twindImports(importMap.imports);
console.log(JSON.stringify(importMap, null, 2));
ENND
deno run --import-map=import_map.json -A - <<"ENND"
import "$fresh/server.ts";
import "$fresh/plugins/twind.ts";
import "$fresh/runtime.ts";
import "preact/jsx-runtime";
ENND
EOF
