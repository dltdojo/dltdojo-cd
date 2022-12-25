#!/bin/sh
cat > Dockerfile.103 <<"EOF"
# syntax=docker/dockerfile:1.3-labs
FROM node:18-alpine as strapi-build101
RUN apk update && apk add build-base gcc autoconf automake zlib-dev libpng-dev vips-dev && rm -rf /var/cache/apk/* > /dev/null 2>&1
WORKDIR /app
RUN yarn global add @strapi/strapi@v4.5.4 --network-timeout 100000
RUN yarn create strapi-app app101 --no-run --quickstart
WORKDIR /app/app101
RUN strapi install documentation

FROM node:18-alpine as strapi101
RUN apk add vips-dev git &&  rm -rf /var/cache/apk/*
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY --from=strapi-build101 /app/app101 ./
EXPOSE 1337
CMD ["strapi", "develop"]

FROM public.ecr.aws/docker/library/alpine:3.17.0 AS githttp101
RUN apk --no-cache add busybox-extras curl git-daemon lighttpd git-gitweb perl-cgi
EOF
cat > docker-compose.yaml <<"EOF"
version: "3.8"
services:
  strapi102:
    build:
      context: .
      dockerfile: Dockerfile.103
      target: strapi101
    command: 
      - /bin/sh
      - -c
      - |
        env
        sleep 10
        ls -lah /app
        git config --global user.email "foo1001@testing.local"
        git config --global user.name "FooName1001"
        cd /app
        git init -q
        git remote add upstream101 http://githttp101:80/git/foo
        git remote -v
        git add . && git commit -m 'init commit'
        git pull
        git push --set-upstream upstream101 master
        strapi develop &
        while true
        do
          if [ -n "$(git status --porcelain)" ]; then
            git status --porcelain
            git pull
            git add .
            git commit -m 'commit something'
            git push --set-upstream upstream101 master
          fi
          sleep 10
        done
    ports:
      - "1337:1337"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.strapi1.rule=Host(`strapi.localhost`)"
      - "traefik.http.routers.strapi1.entrypoints=web"
      - "traefik.http.services.strapi1.loadbalancer.server.port=1337"
  githttp101:
    build:
      context: .
      dockerfile: Dockerfile.103
      target: githttp101
    entrypoint: sh
    command:
      - -c
      - |
        env
        id
        mkdir -p /app/repo/foo
        git config --system http.receivepack true
        git config --system http.uploadpack true
        git config --system user.email "gitserver@dev.local"
        git config --system user.name "Git Server"
        git config --global user.email "you@example.com"
        git config --global user.name "Your Name"
        mkdir -p /app/repo/foo; cd /app/repo/foo &&  git init --bare -q && echo "strapi project 1234" > description
        cd /app/repo/foo
        ls -alh
        git branch
        #
        # https://github.com/ryan0x44/local-git-server
        # NOTE: docker compose escape $$ 
        #
        cat <<\EOF > /etc/lighttpd/lighttpd.conf
        server.document-root = "/app/repo"
        server.modules += ( "mod_alias", "mod_cgi", "mod_setenv" )
        $$HTTP["host"] =~ "" { 
          alias.url += ( "/git" => "/usr/libexec/git-core/git-http-backend")
          $$HTTP["url"] =~ "^/git" {
            cgi.assign = ( "" => "" )
            setenv.add-environment = (
              "GIT_PROJECT_ROOT" => "/app/repo",
              "GIT_HTTP_EXPORT_ALL" => "1"
            )
          }
        }
        EOF
        echo "git instaweb /app/repo/foo to port 1234 and mapping to http://localhost:9080"
        cd /app/repo/foo &&  git instaweb
        echo "git http push port 80"
        lighttpd -D -f /etc/lighttpd/lighttpd.conf
    ports:
      - 9080:1234
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.gitweb1.rule=Host(`gitweb.localhost`)"
      - "traefik.http.routers.gitweb1.entrypoints=web"
      - "traefik.http.services.gitweb1.loadbalancer.server.port=1234"
  traefik:
    image: "traefik:v2.9"
    command:
      #- "--log.level=DEBUG"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "8700:80"
      - "8780:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
EOF

echo "docker compose build"
echo "docker compose up"
echo "strapi http://strapi.localhost:8700/admin/"
echo "gitweb http://gitweb.localhost:8700/"
