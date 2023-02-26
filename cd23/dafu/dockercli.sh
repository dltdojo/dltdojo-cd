#!/bin/sh
$DENO_VERSION=1.31.1
$APPTS_URL=https://raw.githubusercontent.com/dltdojo/dltdojo-cd/v0.1.3/cd23/dafu/app.ts
$ALLOW_ENV=XDG_DATA_HOME,HOME
$ALLOW_READ=$HOME/.local/share/dax,/usr/bin/deno,/tmp
$ALLOW_NET=deno.land,raw.githubusercontent.com
docker run -i --rm --entrypoint=sh denoland/deno:$DENO_VERSION <<EOF
id
which deno
env
deno --version
deno info
deno run --allow-env=$ALLOW_ENV \
  --allow-net=$ALLOW_NET \
  --allow-read=$ALLOW_READ  \
  $APPTS_URL
EOF

docker run -it --rm denoland/deno:$DENO_VERSION run \
  --allow-env=$ALLOW_ENV --allow-net=$ALLOW_NET --allow-read=$ALLOW_READ  \
  $APPTS_URL