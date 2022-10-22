# GOAL

啟動 HTTP 服務。

# TOOLs

- [httpd - Official Image | Docker Hub](https://hub.docker.com/_/httpd)

# ALTs

## Static Site Generation(SSG) v.s. Server-Side Rendering(SSR)

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