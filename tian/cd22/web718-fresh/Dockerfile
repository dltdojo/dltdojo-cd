# syntax=docker/dockerfile:1.3-labs
FROM denoland/deno:alpine-1.29.1 AS web718-fresh102
WORKDIR /app
RUN <<EOF
cd /tmp
cat > import_map.json <<"EOOOF"
{
  "imports": {
    "$fresh/": "https://deno.land/x/fresh@1.1.2/",
    "preact": "https://esm.sh/preact@10.11.0?pin=v99",
    "preact/": "https://esm.sh/preact@10.11.0/",
    "preact-render-to-string": "https://esm.sh/*preact-render-to-string@5.2.4",
    "@preact/signals": "https://esm.sh/*@preact/signals@1.0.3",
    "@preact/signals-core": "https://esm.sh/*@preact/signals-core@1.0.1",
    "twind": "https://esm.sh/twind@0.16.17",
    "twind/": "https://esm.sh/twind@0.16.17/"
  }
}
EOOOF
cat > deps.ts <<"EOOOF"
import "$fresh/server.ts";
import "$fresh/plugins/twind.ts";
import "$fresh/runtime.ts";
import "preact/jsx-runtime";
EOOOF
cd /tmp
deno cache --import-map=import_map.json deps.ts
EOF
FROM denoland/deno:alpine-1.29.1 AS web718-fresh104
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
FROM denoland/deno:alpine-1.29.1 AS web718-fresh102-create-new-project
WORKDIR /app
RUN <<"EOF"
cd /tmp
deno run -A -r https://deno.land/x/fresh@1.1.2/init.ts foo --twind --vscode --force
cd /tmp/foo ; deno cache main.ts
EOF