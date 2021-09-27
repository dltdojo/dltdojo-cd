# YiTian01 壹天壹時 Docker

展開旅程前需要先收集工具，提供操控各式工具的容器化應用 Docker 為第一個需要安裝完成的工具。Docker 在各平台也不同的安裝方式請自行搜尋安裝完成。

- [Docker - 維基百科，自由的百科全書](https://zh.wikipedia.org/zh-tw/Docker)
- [Install Docker Engine | Docker Documentation](https://docs.docker.com/engine/install/)
- [Docker Tutorial for Beginners [FULL COURSE in 3 Hours] - YouTube](https://www.youtube.com/watch?v=3c-iBn73dDE)
- [docker - YouTube](https://www.youtube.com/results?search_query=docker&sp=EgIYAg%253D%253D)
- HTTP
  - [Evolution of HTTP - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Evolution_of_HTTP#invention_of_the_world_wide_web)
  - [curlimages/curl Tags | Docker Hub](https://hub.docker.com/r/curlimages/curl/tags?page=1&ordering=last_updated)
  - [Httpd - Official Image | Docker Hub](https://hub.docker.com/_/httpd)
  - [The Apache HTTP Server Project](https://httpd.apache.org/)
  - [Php - Official Image | Docker Hub](https://hub.docker.com/_/php)
  - [buildkite/puppeteer - Docker Image | Docker Hub](https://hub.docker.com/r/buildkite/puppeteer)
  - [puppeteer/puppeteer: Headless Chrome Node.js API](https://github.com/puppeteer/puppeteer)
- Nmap Network Scanning
  - [instrumentisto/nmap - Docker Image | Docker Hub](https://hub.docker.com/r/instrumentisto/nmap)
  - [Common Platform Enumeration (CPE) | Nmap Network Scanning](https://nmap.org/book/output-formats-cpe.html)
  - [Common Platform Enumeration - Wikipedia](https://en.wikipedia.org/wiki/Common_Platform_Enumeration)
  - [cpe:/a:apache:http_server:2.4.41 - NVD - Search Common Platform Enumerations (CPE)](https://nvd.nist.gov/products/cpe/search/results?namingFormat=2.2&keyword=cpe%3A%2Fa%3Aapache%3Ahttp_server%3A2.4.41)
- PostgreSQL
  - [SQL - Wikipedia](https://en.wikipedia.org/wiki/SQL)
  - [Postgres - Official Image | Docker Hub](https://hub.docker.com/_/postgres?tab=description&page=1&ordering=last_updated)
  - The CREATE USER statement is a PostgreSQL extension. The SQL standard leaves the definition of users to the implementation. [PostgreSQL: Documentation: 12: CREATE USER](https://www.postgresql.org/docs/12/sql-createuser.html)
- Bitcoin
  - [bitcoin/bitcoin: Bitcoin Core integration/staging tree](https://github.com/bitcoin/bitcoin)
  - [ruimarinho/docker-bitcoin-core: A bitcoin-core docker image](https://github.com/ruimarinho/docker-bitcoin-core)
- Ethereum
  - [ethereum/go-ethereum: Official Go implementation of the Ethereum protocol](https://github.com/ethereum/go-ethereum)
  - [ethereum/client-go - Docker Image | Docker Hub](https://hub.docker.com/r/ethereum/client-go)

# 任務

- hello-world
- 網路 HTTP 資源讀取
- 製作一個關聯性資料庫使用者帳戶
- 製作一個靜態 HTTP 服務
- 顯示一組 NVD 有漏洞紀錄的 Common Platform Enumeration
- 製作一個動態 HTTP 服務
- 製作一個比特幣帳戶地址
- 製作一個以太坊帳戶地址

```
$ docker run hello-world
$ docker run docker.io/curlimages/curl:7.79.1 -sv http://info.cern.ch/hypertext/WWW/TheProject.html
```

資料庫 PostgreSQL 新增使用者

```
$ docker run -d --name my-db -e POSTGRES_PASSWORD=password docker.io/postgres:13-alpine && \
    sleep 10 && \
    docker exec -it my-db psql -U postgres -c "CREATE DATABASE db101 ;" && \
    docker exec -it my-db psql -U postgres -c "CREATE USER alice WITH ENCRYPTED PASSWORD 'alicepass'; GRANT ALL PRIVILEGES ON DATABASE db101 TO alice;" && \
    docker exec -it my-db psql -U postgres -l && \
    docker stop my-db && \
    docker rm my-db
```

製作靜態 HTTP 服務與展示 CPE

```
$ docker network create --driver bridge foonet && \
    docker run -d --name my-http -p 8081:80 --network foonet docker.io/httpd:2.4.41-alpine && \
    sleep 6 && \
    docker exec -it my-http cat /usr/local/apache2/htdocs/index.html && \
    docker exec -it my-http sed -i "s/It/DLTDOJO-CD/g" /usr/local/apache2/htdocs/index.html && \
    docker run --rm -it --network foonet docker.io/curlimages/curl:7.79.1 -sv http://my-http:80 && \
    docker run --rm -it --network foonet docker.io/instrumentisto/nmap:7.92 -A -T4 -oX - my-http && \
    docker stop my-http && \
    docker rm my-http && \
    docker network rm foonet
```

製作動態 HTTP 服務，測試前端的 ```docker.io/buildkite/puppeteer:10.0.0``` 約 420 MB 需注意預留空間與下載時間。

```
$ docker network create --driver bridge foonet && \
  docker run -d --name my-php -p 8081:80 --network foonet docker.io/php:7.2-apache && \
  sleep 6 && \
  docker exec -i my-php /bin/sh <<\EOF &&
cat <<\HERE > /var/www/html/index.php
<HTML>
<HEAD>
<TITLE>DLTDOJO-CD</TITLE>
</HEAD>
<BODY>
<H2>Frontend Time : <span id="frontend-time"></span></H2>
<H2>Backend Time : 
<?php 
$today = date('Y-m-d H:i:s'); 
echo $today; 
?>
</H2>
<script>
const d = new Date();
document.getElementById("frontend-time").innerHTML = d.toISOString();
</script>
</BODY>
</HTML>
HERE
EOF
  docker run --network foonet docker.io/curlimages/curl:7.79.1 -sv http://my-php:80 && \
  docker run -i --network foonet docker.io/buildkite/puppeteer:10.0.0 /bin/sh <<\EOF2 &&
cat <<\HERE2 > test.js
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto("http://my-php:80/", {waitUntil: 'networkidle0'});
  const html = await page.content(); // serialized HTML of page DOM.
  console.log(html);
  await browser.close();
})();
HERE2
node test.js
EOF2
  docker stop my-php && \
  docker rm my-php && \
  docker network rm foonet
```

比特幣與以太坊新增地址

```
$ docker run --entrypoint sh docker.io/ruimarinho/bitcoin-core:0.16-alpine \
  -c "bitcoind -printtoconsole -regtest=1 & sleep 7 ; bitcoin-cli -regtest getnewaddress"
$ docker run --entrypoint sh docker.io/ethereum/client-go:v1.10.4 \
  -c "echo "TESTONLY" > pwd.txt ; geth account new --password pwd.txt"
$ docker run -it docker.io/ethereum/client-go:v1.10.4 account new
```

# 其他討論

docker-compose 是個方便使用的容器服務組合工具，請自行參照 [Overview of Docker Compose | Docker Documentation](https://docs.docker.com/compose/) 練習，DLTDOJO-CD 會以 kubernetes 作為服務組建調度為練習目標。