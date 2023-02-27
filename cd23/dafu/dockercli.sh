#!/bin/sh
DENO_VERSION=1.31.1
#CD23_VERSION=v0.1.4
CD23_VERSION=main
APPTS_URL=https://raw.githubusercontent.com/dltdojo/dltdojo-cd/$CD23_VERSION/cd23/dafu/app.ts
ALLOW_ENV=XDG_DATA_HOME,HOME
ALLOW_READ=/root/.local/share/dax,/bin/deno,/usr/bin/deno,/tmp,/app
ALLOW_WRITE=/root/.local/share/dax
ALLOW_NET=deno.land,raw.githubusercontent.com

echo "==> 1"
docker run -i --rm --workdir=/app --entrypoint=sh denoland/deno:$DENO_VERSION <<EOF
id
which deno
env
deno --version
deno info
deno run --allow-env=$ALLOW_ENV \
  --allow-net=$ALLOW_NET \
  --allow-read=$ALLOW_READ  \
  --allow-write=$ALLOW_WRITE \
  $APPTS_URL help
EOF

echo "==> 2"

docker run -it --rm --workdir=/app denoland/deno:$DENO_VERSION run \
  --allow-env=$ALLOW_ENV --allow-net=$ALLOW_NET --allow-read=$ALLOW_READ  --allow-write=$ALLOW_WRITE \
  $APPTS_URL help

echo "==> 3"

DENO_IMG=deno1234
docker build -t ${DENO_IMG} - <<EOF
FROM denoland/deno:alpine-$DENO_VERSION
RUN apk add --no-cache jq openssl curl coreutils
WORKDIR /app
RUN deno cache $APPTS_URL
EOF

docker run -it --rm $DENO_IMG run \
  --allow-env=$ALLOW_ENV --allow-net=$ALLOW_NET --allow-read=$ALLOW_READ  --allow-write=$ALLOW_WRITE \
  $APPTS_URL help