
# ⛅️ 101 hello-world

```sh
docker build -t dod101 .
docker run -i --init --rm -v /var/run/docker.sock:/var/run/docker.sock dod101 <<EOF
env
docker run hello-world
EOF
```

# ⛄️ 102 busybox httpd

啟動後的容器需手動停止。

```sh
docker run -i --init --rm -v /var/run/docker.sock:/var/run/docker.sock dod101 <<EOF
env
docker run -i --init --rm -p 8300:3000 --rm busybox:1.35.0 <<EOOF
cat <<\EOOOF > index.html
<html>
<head><title>busybox</title></head>
<body><p>Busybox Httpd</p></body>
</html>
EOOOF
env
busybox httpd -fv -p 3000
EOOF
EOF
```

# ⛩️ 103 docker compose

啟動後的容器需手動停止。

```sh
docker compose -f docker-compose.103.yaml up
```