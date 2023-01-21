# GOAL

啟動極小 HTTP 服務，busybox httpd 約 720KB。

[busybox - Official Image | Docker Hub](https://hub.docker.com/_/busybox)


```sh
docker pull busybox:1.35.0
```

start busybox httpd

```sh
docker run -i --init -p 8030:3000 busybox:1.35.0 /bin/sh <<\EOF
echo http://Ghost-in-the-Shell.localhost:8030
cat <<\EOOF > index.html
<html>
<head><title>busybox httpd 2022</title></head>
<body><p>HELLO Busybox Httpd</p></body>
</html>
EOOF
busybox httpd -f -v -p 3000 
EOF
```

curl test

```sh
curl -sv http://Ghost-in-the-Shell.localhost:8030
```

curl result

```sh
*   Trying ::1:8030...
* Connected to Ghost-in-the-Shell.localhost (::1) port 8030 (#0)
> GET / HTTP/1.1
> Host: Ghost-in-the-Shell.localhost:8030
> User-Agent: curl/7.78.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Date: Wed, 26 Oct 2022 08:15:37 GMT
< Connection: close
< Content-type: text/html
< Accept-Ranges: bytes
< Last-Modified: Wed, 26 Oct 2022 08:15:16 GMT
< ETag: "6358ec94-66"
< Content-Length: 102
< 
<html>
<head><title>busybox httpd 2022</title></head>
<body><p>HELLO Busybox Httpd</p></body>
</html>
* Closing connection 0
```

404 Not Found 資源位置出錯為正常反應，真的「404」找不到 Not Found 而變成 200 OK 就可能有大問題。

攻擊者通常會嘗試查找未修補的缺陷、常見端點或未受保護的文件和目錄，以獲取未經授權的訪問或系統知識。[API7:2019 Security Misconfiguration · OWASP/API-Security](https://github.com/OWASP/API-Security/blob/master/2019/en/src/0xa7-security-misconfiguration.md#api72019-security-misconfiguration)


curl /etc/passwd

```sh
curl -sv http://Ghost-in-the-Shell.localhost:8030/etc/passwd
```

200 OK 

```sh
*   Trying ::1:8030...
* Connected to Ghost-in-the-Shell.localhost (::1) port 8030 (#0)
> GET /etc/passwd HTTP/1.1
> Host: Ghost-in-the-Shell.localhost:8030
> User-Agent: curl/7.78.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Date: Wed, 26 Oct 2022 08:16:55 GMT
< Connection: close
< Accept-Ranges: bytes
< Last-Modified: Sun, 02 Oct 2022 21:21:57 GMT
< ETag: "633a00f5-154"
< Content-Length: 340
< 
root:x:0:0:root:/root:/bin/sh
daemon:x:1:1:daemon:/usr/sbin:/bin/false
bin:x:2:2:bin:/bin:/bin/false
sys:x:3:3:sys:/dev:/bin/false
sync:x:4:100:sync:/bin:/bin/sync
mail:x:8:8:mail:/var/spool/mail:/bin/false
www-data:x:33:33:www-data:/var/www:/bin/false
operator:x:37:37:Operator:/var:/bin/false
nobody:x:65534:65534:nobody:/home:/bin/false
* Closing connection 0
```

正常配置版本。

```sh
docker run -i --init -p 8030:3000 busybox:1.35.0 /bin/sh <<\EOF
echo http://Ghost-in-the-Shell.localhost:8030
cd /tmp
cat <<\EOOF > index.html
<html>
<head><title>busybox httpd 2022</title></head>
<body><p>HELLO Busybox Httpd</p></body>
</html>
EOOF
busybox httpd -f -v -p 3000 
EOF
```

curl /etc/passwd

```sh
curl -sv http://Ghost-in-the-Shell.localhost:8030/etc/passwd
```

404 Not Found

```sh
*   Trying ::1:8030...
* Connected to Ghost-in-the-Shell.localhost (::1) port 8030 (#0)
> GET /etc/passwd HTTP/1.1
> Host: Ghost-in-the-Shell.localhost:8030
> User-Agent: curl/7.78.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 404 Not Found
< Date: Wed, 26 Oct 2022 08:18:42 GMT
< Connection: close
< Content-type: text/html
< 
<HTML><HEAD><TITLE>404 Not Found</TITLE></HEAD>
<BODY><H1>404 Not Found</H1>
The requested URL was not found
</BODY></HTML>
* Closing connection 0
```

docker compose version

```sh
docker compose -f - up <<\EOF
services:
  busybox:
    image: docker.io/busybox:1.35.0
    container_name: Ghost-in-the-Shell
    entrypoint: sh
    command:
      - -c
      - |
        echo http://Ghost-in-the-Shell.localhost:8030
        cd /tmp
        cat <<\EOOF > index.html
        <html>
        <head><title>busybox httpd 2022</title></head>
        <body><p>HELLO Busybox Httpd</p></body>
        </html>
        EOOF
        busybox httpd -f -v -p 3000 
    ports:
      - "8030:3000"
  curl:
    image: curlimages/curl
    command:
      - sh
      - -c
      - |
        sleep 3
        curl -sv http://Ghost-in-the-Shell:3000/index.html
EOF
```


# TOOLs

- [httpd - Official Image | Docker Hub](https://hub.docker.com/_/httpd)

# ALTs

## Shell Script : Static Site Generation(SSG) v.s. Server-Side Rendering(SSR)

SSG, SSR and CSR 的 busybox httpd cgi 極簡概念展示版本，busybox 鏡像約 720 KB，下載與啟動超快。啟動後點擊 http://localhost:8030 測試。

修改日期的位置如下：

- SSG 在 ```TODAY=$(date)```
- SSR 在 ```sed "s|_SSR_DATA_|$(date)|g" /www/index.html```
- CSR 在 ```document.getElementById("csr101").innerHTML = new Date();```

```sh
docker run -i --init -p 8030:3000 busybox:1.35.0 <<\EOF
mkdir /www /www/cgi-bin
TODAY=$(date)
cat <<EOOF > /www/index.html
<html>
<head>
<title>SSG, SSR and CSR</title>
 <style>
  body {background-color: pink;}
  div.container { align-items: center; justify-content: center }
</style> 
</head>
<body onload="csr()">
  <div class="container">
  <h1>SSG/CSR Page: <a href="/index.html">index.html</a></h1>
  <h1>SSG/SSR/CSR Page: <a href="/cgi-bin/index.sh">/cgi-bin/index.sh</a></h1>
  <h3>Static Site Generation(SSG): $TODAY</h3>
  <h3>Server-Side Rendering(SSR): _SSR_DATA_ </h3>
  <h3>Client-Side Rendering(CSR): <span id="csr101">_CSR_DATA_</span></h3>
  </div>
  <script>
  function csr() {
    document.getElementById("csr101").innerHTML = new Date();
  }
</script>
</body>
</html>
EOOF
cat <<\EOOF > /www/cgi-bin/index.sh
#!/bin/sh
echo "Content-Type: text/html"
echo ""
sed "s|_SSR_DATA_|$(date)|g" /www/index.html
echo ""
EOOF
chmod 700 /www/cgi-bin/index.sh
cd /www
busybox httpd -f -v -p 3000 
EOF
```

refs

- The new wave of Javascript web frameworks https://frontendmastery.com/posts/the-new-wave-of-javascript-web-frameworks/


apache cgi version

```sh
docker pull docker.io/docker/dockerfile:1.3-labs
docker pull docker.io/httpd:2.4.54-alpine3.16

DOCKER_BUILDKIT=1 docker build -t apache-cgi-sh - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM docker.io/httpd:2.4.54-alpine3.16
RUN <<EOOF
sed 's/#LoadModule cgid_module/LoadModule cgid_module/' -i /usr/local/apache2/conf/httpd.conf
sed 's/#Scriptsock cgisock/Scriptsock cgisock/' -i /usr/local/apache2/conf/httpd.conf
sed 's/#AddHandler cgi-script .cgi/AddHandler cgi-script .cgi .sh/' -i /usr/local/apache2/conf/httpd.conf
cat <<\EOOOF > /usr/local/apache2/htdocs/index.html
<html>
    <head>
      <meta charset="UTF-8">
      <title>APACHE CGI 🔑🗝📦🔗⌛🦉🧩🎭🛂💸 2022</title>
    </head>
    <body><h1>APACHE CGI 🔑🗝📦🔗⌛🦉🧩🎭🛂💸 2022</h1></body>
</html>
EOOOF
cat <<\EOOOF > /usr/local/apache2/cgi-bin/hello.sh
#!/bin/sh
echo "Content-type: text/html; charset=utf-8"
echo
echo "<html>"
echo "<head><meta charset="UTF-8"><title>APACHE CGI 🔑🗝📦🔗⌛🦉🧩🎭🛂💸 2022</title></head>"
echo "<body><h1>APACHE CGI 🔑🗝📦🔗⌛🦉🧩🎭🛂💸 2022</h1><h2>"
echo $(date)
echo "</h2></body>"
echo "</html>"
EOOOF
chmod 755 /usr/local/apache2/cgi-bin/hello.sh
EOOF
EOF

docker run -it -p 8080:80 apache-cgi-sh
```

- SSG: http://localhost:8080/index.html
- SSR: http://localhost:8080/cgi-bin/hello.sh

SSG

```sh
$ curl -sv http://localhost:8080
*   Trying 127.0.0.1:8080...
* Connected to localhost (127.0.0.1) port 8080 (#0)
> GET / HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.78.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Date: Sat, 22 Oct 2022 14:13:29 GMT
< Server: Apache/2.4.54 (Unix)
< Last-Modified: Sat, 22 Oct 2022 14:11:54 GMT
< ETag: "e2-5eba023f98baa"
< Accept-Ranges: bytes
< Content-Length: 226
< Content-Type: text/html
< 
<html>
    <head>
      <meta charset="UTF-8">
      <title>APACHE CGI 🔑🗝📦🔗⌛🦉🧩🎭🛂💸 2022</title>
    </head>
    <body><h1>APACHE CGI 🔑🗝📦🔗⌛🦉🧩🎭🛂💸 2022</h1></body>
</html>
* Connection #0 to host localhost left intact
```

SSR 

```sh
$ curl -sv http://localhost:8080/cgi-bin/hello.sh
*   Trying 127.0.0.1:8080...
* Connected to localhost (127.0.0.1) port 8080 (#0)
> GET /cgi-bin/hello.sh HTTP/1.1
> Host: localhost:8080
> User-Agent: curl/7.78.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Date: Sat, 22 Oct 2022 14:13:32 GMT
< Server: Apache/2.4.54 (Unix)
< Transfer-Encoding: chunked
< Content-Type: text/html; charset=utf-8
< 
<html>
<head><meta charset=UTF-8><title>APACHE CGI 🔑🗝📦🔗⌛🦉🧩🎭🛂💸 2022</title></head>
<body><h1>APACHE CGI 🔑🗝📦🔗⌛🦉🧩🎭🛂💸 2022</h1><h2>
Sat Oct 22 14:13:32 UTC 2022
</h2></body>
</html>
* Connection #0 to host localhost left intact
```

## JavaScript-HTML-DOM : SSG v.s. SSR

實際上不會想用純 shell script 來處裡 HTML 服務端渲染，因為輸入實在太複雜容易出錯很難除錯，可參考 [ Process input to a CGI script : Search · 1995 Frank Pilhofer](https://github.com/search?l=Shell&p=1&q=1995+Frank+Pilhofer&type=Code) ，另外也缺少處理 The HTML DOM (Document Object Model) 的工具。

常見的 HTML DOM 修改範例。

```html
<html>
<body>
<p id="demo"></p>
<script>
document.getElementById("demo").innerHTML = "Hello World!";
</script>
</body>
</html> 
```

經過瀏覽器渲染後的呈現結果。

```html
<html>
<body>
<p id="demo">Hello World!</p>
</body>
</html>
```

將瀏覽器作的渲染移到服務端的作法分成 SSG 與 SSR。使用 deno 作範例因為不須 bundle 或是 install 很方便。

- [Using JSX and the DOM | Manual | Deno](https://deno.land/manual@v1.26.0/jsx_dom)
- [File Server | Manual | Deno](https://deno.land/manual@v1.26.1/examples/file_server)
- [denoland/deno - Docker Image | Docker Hub](https://hub.docker.com/r/denoland/deno)

SSG version

```sh
docker pull docker.io/denoland/deno:1.26.2

docker run -i -p 8080:3000 --entrypoint sh docker.io/denoland/deno:1.26.2 <<\EOF
cat <<\EOOF | deno run --allow-net - 
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
const document = new DOMParser().parseFromString(
  `<!DOCTYPE html>
  <html lang="en">
    <head><meta charset="UTF-8"><title>SSG Js+DOM 2022</title></head>
    <body><p id="demo"></p></body>
  </html>`,
  "text/html",
);
document.getElementById("demo").innerHTML = `SSG Version:  🔑🗝📦🔗⌛🦉🧩🎭🛂💸 ${new Date()} !`;
const htmlSSG = document.documentElement.outerHTML;
console.log(htmlSSG);

import { serve } from "https://deno.land/std@0.160.0/http/server.ts";

serve((_req) => {
  return new Response(htmlSSG, {
    headers: { "content-type": "text/html" },
  });
}, { port: 3000 });
EOOF
EOF
```

SSR version

```sh
docker run -i -p 8080:3000 --entrypoint sh docker.io/denoland/deno:1.26.2 <<\EOF
cat <<\EOOF | deno run --allow-net - 
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
const document = new DOMParser().parseFromString(
  `<!DOCTYPE html>
  <html lang="en">
    <head><meta charset="UTF-8"><title>SSR Js+DOM 2022</title></head>
    <body><p id="demo"></p></body>
  </html>`,
  "text/html",
);

import { serve } from "https://deno.land/std@0.160.0/http/server.ts";

serve((_req) => {
  document.getElementById("demo").innerHTML = `SSR Version:  🔑🗝📦🔗⌛🦉🧩🎭🛂💸 ${new Date()} !`;
  const htmlSSG = document.documentElement.outerHTML;
  return new Response(htmlSSG, {
    headers: { "content-type": "text/html" },
  });
}, { port: 3000 });
EOOF
EOF
```

- http://localhost:8080
- SSG 與 SSR 觀察生成時間可發現差異。

SG/SSR import-online-js version

```sh
docker run --rm curlimages/curl -sv https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web200-http-server/ssg-dom101.js

docker run -it --rm -p 8080:3000 docker.io/denoland/deno:1.26.2 run --allow-net https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web200-http-server/ssg-dom101.js
docker run -it --rm -p 8081:3000 docker.io/denoland/deno:1.26.2 run --allow-net https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web200-http-server/ssr-dom101.js
```

- SSG version http://localhost:8080
- SSR version http://localhost:8081

SSG/SSR compose up

- escape a dollar sign in a docker compose file? - Stack Overflow https://stackoverflow.com/questions/40619582/how-can-i-escape-a-dollar-sign-in-a-docker-compose-file
- 造成要改寫 js 成難辨識的 ```$${new Date()}```

docker compose up

```sh
docker compose -f - up <<\EOF
services:
  ssrdom:
    image: docker.io/denoland/deno:1.26.2
    entrypoint: sh
    command:
      - -c
      - |
        cat <<\EOOF | deno run --allow-net - 
        import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
        serve((_req) => {
          const txtSSG = `SSR Version:🔑🗝📦🔗⌛🦉🧩🎭🛂💸 $${new Date()} !`;
            return new Response(txtSSG, { headers: { "content-type": "text/plain;charset=UTF-8" },});
          } , { port: 3000 });
        EOOF
    ports:
      - "8081:3000"
EOF
```

SSG/SSR : docker compose up

```sh
docker compose -f - up <<\EOF
services:
  ssgdom:
    image: docker.io/denoland/deno:1.26.2
    entrypoint: sh
    command:
      - -c
      - |
        cat <<\EOOF | deno run --allow-net - 
        import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
        const document = new DOMParser().parseFromString(
           `<!DOCTYPE html><html lang="en">
            <head><meta charset="UTF-8"><title>SSG Js+DOM 2022</title></head>
            <body><p id="demo"></p></body></html>`,
           "text/html",
        );
        document.getElementById("demo").innerHTML = `SSG Version:🔑🗝📦🔗⌛🦉🧩🎭🛂💸 $${new Date()} !`;
        const htmlSSG = document.documentElement.outerHTML;
        import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
        serve((_req) => {
          return new Response(htmlSSG, { headers: { "content-type": "text/html" },});}, { port: 3000 });
        EOOF
    ports:
      - "8080:3000"
  ssrdom:
    image: docker.io/denoland/deno:1.26.2
    entrypoint: sh
    command:
      - -c
      - |
        cat <<\EOOF | deno run --allow-net - 
        import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
        const document = new DOMParser().parseFromString(
           `<!DOCTYPE html><html lang="en">
            <head><meta charset="UTF-8"><title>SSR Js+DOM 2022</title></head>
            <body><p id="demo"></p></body></html>`,
           "text/html",
        );
        import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
        serve((_req) => {
          document.getElementById("demo").innerHTML = `SSR Version:🔑🗝📦🔗⌛🦉🧩🎭🛂💸 $${new Date()} !`;
          const htmlSSG = document.documentElement.outerHTML;
          return new Response(htmlSSG, { headers: { "content-type": "text/html" },});}, { port: 3000 });
        EOOF
    ports:
      - "8081:3000"
  ssrdom-online:
    image: docker.io/denoland/deno:1.26.2
    command: "run --allow-net https://raw.githubusercontent.com/dltdojo/dltdojo-cd/main/tian/cd22/web200-http-server/ssr-dom101.js"
    ports:
      - "8082:3000"
EOF
```

## kubernetes SSG version

- Connecting Applications with Services | Kubernetes https://kubernetes.io/docs/concepts/services-networking/connect-applications-service/
- k3d https://k3d.io/v5.4.6/
- ```k3d cluster create k8s101 -p "8089:80@loadbalancer" --agents 2```
- SSG http://ssg-dom.localhost:8089

```sh
kubectl apply -f - <<\EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ssg-dom-101
spec:
  selector:
    matchLabels:
      run: ssg-dom
  replicas: 1
  template:
    metadata:
      labels:
        run: ssg-dom
    spec:
      containers:
      - name: ssg-dom
        image: docker.io/denoland/deno:1.26.2
        command: ["/bin/sh"]
        args:
          - -c
          - |
            cat <<\EOOF | deno run --allow-net - 
            import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
            const document = new DOMParser().parseFromString(
               `<!DOCTYPE html><html lang="en">
                <head><meta charset="UTF-8"><title>SSG Js+DOM 2022</title></head>
                <body><p id="demo"></p></body></html>`,
               "text/html",
            );
            document.getElementById("demo").innerHTML = `SSG Version:🔑🗝📦🔗⌛🦉🧩🎭🛂💸 ${new Date()} !`;
            const htmlSSG = document.documentElement.outerHTML;
            import { serve } from "https://deno.land/std@0.160.0/http/server.ts";
            serve((_req) => {
              return new Response(htmlSSG, { headers: { "content-type": "text/html" },});}, { port: 3000 });
            EOOF
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: ssg-dom-101
  labels:
    run: ssg-dom
spec:
  ports:
  - port: 80
    targetPort: 3000
    protocol: TCP
  selector:
    run: ssg-dom
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: k8singress
  annotations:
    ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
  - host: "ssg-dom.localhost"
    http:
      paths:
      - pathType: Prefix
        path: "/"
        backend:
          service:
            name: ssg-dom-101
            port:
              number: 80
EOF
```

# JSX: SSG v.s. SSR

- [Using JSX | Deploy Docs](https://deno.com/deploy/docs/using-jsx)
- bundle不用之[preactjs/preact-render-to-string: Universal rendering for Preact: render JSX and Preact components to HTML.](https://github.com/preactjs/preact-render-to-string/)
