#!/bin/sh
docker run -i --rm --entrypoint=sh denoland/deno:1.31.0 <<EOF
id
which deno
env
cat <<'EXXF' > /tmp/app.ts
import { BaseCliCommander } from "https://raw.githubusercontent.com/dltdojo/dltdojo-cd/v0.1.2/cd23/mod.ts";
new BaseCliCommander().parse();
EXXF
deno --version
deno info
deno run --allow-env=XDG_DATA_HOME,HOME \
  --allow-net=deno.land,raw.githubusercontent.com \
  --allow-read=$HOME/.local/share/dax,/usr/bin/deno,/tmp  \
  /tmp/app.ts --help
EOF