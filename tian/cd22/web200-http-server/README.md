# GOAL

啟動 HTTP 服務。

# TOOLs

- [httpd - Official Image | Docker Hub](https://hub.docker.com/_/httpd)

# ALTs

## Shell Script : Static Site Generation(SSG) v.s. Server-Side Rendering(SSR)

apache cgi

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

# JSX: SSG v.s. SSR

- [Using JSX | Deploy Docs](https://deno.com/deploy/docs/using-jsx)
- bundle不用之[preactjs/preact-render-to-string: Universal rendering for Preact: render JSX and Preact components to HTML.](https://github.com/preactjs/preact-render-to-string/)
