export const Dockerfiles = {
  BusyboxHello: `# busybox
FROM busybox:1.36
RUN date > /hello`,
  DenoAlpineGitCurl: `# docker file
FROM denoland/deno:alpine-1.31.1
RUN apk add --no-cache git openssl sed curl jq busybox-extras`
}

export const ConfigureFile = {
  RedisNoProtect101: `# Redis configuration file
bind 0.0.0.0
protected-mode no
maxmemory 2mb
maxmemory-policy allkeys-lru`,

}

export const ShellScripts = {
  BusyboxHello: `#!/bin/sh
id
env
date
busybox | head -1
echo "hello world"`,

  BusyboxHttpd: `#!/bin/sh
id
env
date
busybox | head -1
mkdir /www
echo "<html><head><title>HELLO WORLD</title></head><body><h1>HELLO WORLD</h1></body></html>" > /www/index.html
busybox httpd -fv -h /www -p 3000`,


  DenoAlpineGitCurl: `#!/bin/sh
id
env
busybox
mkdir web
echo "===> httpd start...."
httpd -fv -p 3000 -h web &
echo Busybox Httpd : Hello World : $(date) > web/hello.txt
sleep 3
echo "===> check curl"
curl --version
curl -sv http://localhost:3000/hello.txt
sleep 1
echo "===> check deno"
deno --version
deno run https://deno.land/std@0.177.0/examples/welcome.ts
`
}
