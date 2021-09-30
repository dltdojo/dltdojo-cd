# YiTian01 壹天壹時 Docker & Shell

展開旅程前需先安裝好 2 個必備工具，提供操控各式工具的容器化應用 Docker 為第一個需要安裝完成的工具，另一個工具是 Bash (Unix shell),Docker 與 Bash 在各種 OS 的安裝方式請自行搜尋安裝來完成任務。

除了各式容器應用之外，各種工具組建配置黏合上 Shell 是必備工具，尤其是需要自動化的地方很常用到，在 [‘X’ as code](https://github.blog/2020-10-29-getting-started-with-devops-automation/) 的時代，除了寫成 script 的 sh 檔之外，Dockerfile 與 YAML 內嵌片段 script 來用的場景可說是 Chain+Git+Dev+SecOps 必學的技能。

# 任務

- T1 docker hello-world 與網路 HTTP 資源讀取
- T2 安裝 Bash (Unix shell) 並新增一個 bash script
- T3 製作一個關聯性資料庫使用者帳戶
- T4 製作一個靜態 HTTP 服務並設計顯示一組 NVD 有漏洞紀錄的 Common Platform Enumeration
- T5 製作一個動態 HTTP 服務
- T6 製作一個 Hyperledger Fabric 帳戶之私鑰與自簽 X.509 憑證
- T7 製作一個比特幣帳戶之私鑰與地址
- T8 製作一個以太坊帳戶之私鑰與地址
- T9 幫 Alice 製作一個 W3C Decentralized Identifiers (DIDs) v1.0 規格的 DID

# T1 Docker

docker hello-world 與讀取網路 HTTP 資源

```sh
docker run hello-world
docker run docker.io/curlimages/curl:7.79.1 -sv http://info.cern.ch/hypertext/WWW/TheProject.html
```

- [Docker - 維基百科，自由的百科全書](https://zh.wikipedia.org/zh-tw/Docker)
- [Install Docker Engine | Docker Documentation](https://docs.docker.com/engine/install/)
- [Docker Tutorial for Beginners [FULL COURSE in 3 Hours] - YouTube](https://www.youtube.com/watch?v=3c-iBn73dDE)
- [docker - YouTube](https://www.youtube.com/results?search_query=docker&sp=EgIYAg%253D%253D)
- [Evolution of HTTP - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Evolution_of_HTTP#invention_of_the_world_wide_web)
- [curlimages/curl Tags | Docker Hub](https://hub.docker.com/r/curlimages/curl/tags?page=1&ordering=last_updated)
# T2 Bash

新增 bash script

```sh
$ cat << \EOF > hello-world.sh
#!/usr/bin/env bash

NAME="DLTDOJO"
echo "Hello $NAME!"

EOF

$ bash hello-world.sh
```

- [Bash (Unix shell) - Wikipedia](https://en.wikipedia.org/wiki/Bash_(Unix_shell))
- [鳥哥的 Linux 私房菜 -- 第十章、認識與學習BASH](http://linux.vbird.org/linux_basic/0320bash.php)
- [How do I use Bash on Windows from the Visual Studio Code integrated terminal? - Stack Overflow](https://stackoverflow.com/questions/42606837/how-do-i-use-bash-on-windows-from-the-visual-studio-code-integrated-terminal)
- [Search YAML · apiVersion cat EOF curl](https://github.com/search?l=YAML&q=apiVersion+cat+EOF+curl&type=Code)
- [Search Shell · fabric EOF](https://github.com/search?l=Shell&o=desc&q=fabric+EOF&s=indexed&type=Code)
- [Search Dockerfile · bitcoin](https://github.com/search?l=Dockerfile&o=desc&q=bitcoin&s=indexed&type=Code)
- [Search Shell · ethereum](https://github.com/search?l=Shell&o=desc&q=ethereum&s=indexed&type=Code)
- [Search YAML · apiVersion cat EOF replicas](https://github.com/search?l=YAML&o=desc&q=apiVersion+cat+EOF+replicas&s=&type=Code)

# T3 PostgreSQL account

資料庫 PostgreSQL 新增使用者

```sh
docker run -d --name my-db -e POSTGRES_PASSWORD=password docker.io/postgres:13-alpine
# sleep 10
docker exec -it my-db psql -U postgres -c "CREATE DATABASE db101 ;"
docker exec -it my-db psql -U postgres -c "CREATE USER alice WITH ENCRYPTED PASSWORD 'alicepass'; GRANT ALL PRIVILEGES ON DATABASE db101 TO alice;"
docker exec -it my-db psql -U postgres -l
docker stop my-db
docker rm my-db
```

- [SQL - Wikipedia](https://en.wikipedia.org/wiki/SQL)
- [Postgres - Official Image | Docker Hub](https://hub.docker.com/_/postgres?tab=description&page=1&ordering=last_updated)
- The CREATE USER statement is a PostgreSQL extension. The SQL standard leaves the definition of users to the implementation. [PostgreSQL: Documentation: 12: CREATE USER](https://www.postgresql.org/docs/12/sql-createuser.html)
- [PostgreSQL login with x509 certificate - Stack Overflow](https://stackoverflow.com/questions/52309111/postgresql-login-with-x509-certificate)
# T4 HTTPD

製作靜態 HTTP 服務與展示 CPE

```sh
docker network create --driver bridge foonet
docker run -d --name my-http -p 8081:80 --network foonet docker.io/httpd:2.4.41-alpine
# sleep 6
docker exec -it my-http cat /usr/local/apache2/htdocs/index.html
docker exec -it my-http sed -i "s/It/DLTDOJO-CD/g" /usr/local/apache2/htdocs/index.html
docker run --rm -it --network foonet docker.io/curlimages/curl:7.79.1 -sv http://my-http:80
docker run --rm -it --network foonet docker.io/instrumentisto/nmap:7.92 -A -T4 -oX - my-http
docker stop my-http
docker rm my-http
docker network rm foonet
```

- HTTP
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

# T5 PHP & JavaScript

製作動態 HTTP 服務，測試前端的 ```docker.io/buildkite/puppeteer:10.0.0``` 約 420 MB 需注意預留空間與下載時間。

```sh
docker network create --driver bridge foonet
docker run -d --name my-php -p 8081:80 --network foonet docker.io/php:7.2-apache
# sleep 6
docker exec -i my-php /bin/sh <<\EOF
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
# 
docker run --network foonet docker.io/curlimages/curl:7.79.1 -sv http://my-php:80
docker run -i --network foonet docker.io/buildkite/puppeteer:10.0.0 /bin/sh <<\EOF2
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
#
docker stop my-php
docker rm my-php
docker network rm foonet
```

# T6 Hyperledger Fabric

製作一個 Hyperledger Fabric 帳戶之私鑰與自簽 X.509 憑證

```sh
docker run -i --rm docker.io/alpine:3.14 /bin/sh <<\EOF
apk add openssl
openssl version
X509_CN="Fabric_"$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 6 ; echo )
KEY_PASS=$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20 ; echo )
echo ${X509_CN} ${KEY_PASS}
DIR_KEY="/opt${X509_CN}"
mkdir -p "${DIR_KEY}" && cd "${DIR_KEY}"
OPENSSL_SUBJ="/CN=${X509_CN}/O=DLTDOJO/C=TW/ST=Taichung/OU=Fabric"
openssl ecparam -genkey -name prime256v1 -noout -out ec-p256-priv-key.pem
openssl ec -in ec-p256-priv-key.pem -pubout -out ec-p256-public-key.pem
openssl req -new -x509 -days 10 -out client-cert.crt -key ec-p256-priv-key.pem \
        -subj "${OPENSSL_SUBJ}"
cat ec-p256-priv-key.pem client-cert.crt > client-cert.pem
openssl pkcs12 -export -out keystore.p12 \
        -inkey ec-p256-priv-key.pem \
        -in client-cert.pem \
        -passout "pass:${KEY_PASS}"
ls -al -h
openssl x509 -in client-cert.crt -text -noout
cat ec-p256-priv-key.pem ec-p256-public-key.pem client-cert.crt
openssl pkcs12 -info -passin "pass:${KEY_PASS}" -nodes -in keystore.p12
EOF
```

- [Fabric CA User’s Guide — hyperledger-fabric-cadocs master documentation](https://hyperledger-fabric-ca.readthedocs.io/en/v1.5.0/users-guide.html#getting-started)
- [openssl/openssl: TLS/SSL and crypto library](https://github.com/openssl/openssl)

# T7 Bitcoin account

製作比特幣使用之帳戶私鑰與地址

```sh
docker run -i --rm --entrypoint sh docker.io/ruimarinho/bitcoin-core:0.16-alpine <<\EOF
bitcoind -printtoconsole -regtest=1 & 
sleep 7
ADDR=$(bitcoin-cli -regtest getnewaddress)
echo ${ADDR}
bitcoin-cli -regtest dumpprivkey "${ADDR}"
EOF
```

- [bitcoin/bitcoin: Bitcoin Core integration/staging tree](https://github.com/bitcoin/bitcoin)
- [ruimarinho/docker-bitcoin-core: A bitcoin-core docker image](https://github.com/ruimarinho/docker-bitcoin-core)

# T8 Ethereum account

製作以太坊之帳戶地址

```sh
docker run -i --rm --entrypoint sh docker.io/ethereum/client-go:v1.10.4 <<\EOF
LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20 ; echo > pwd.txt
geth account new --password pwd.txt
EOF
```

製作以太坊之帳戶私鑰與地址

```sh
docker run -i --rm docker.io/node:16.10-alpine3.12 /bin/sh <<\EOF
npm version
mkdir -p /opt/app && cd /opt/app
npm init -y 
npm install --save ethereumjs-wallet
cat <<\HERE > eth_new_account.js
const wallet = require('ethereumjs-wallet').default
const w = wallet.generate();
const address = `0x${w.getAddress().toString('hex')}`;
const privateKey = w.getPrivateKey().toString('hex');
console.log(`Address: ${address}`);
console.log(`Private Key: ${privateKey}`);
HERE
node eth_new_account.js
EOF
```

- [ethereum/go-ethereum: Official Go implementation of the Ethereum protocol](https://github.com/ethereum/go-ethereum)
- [ethereum/client-go - Docker Image | Docker Hub](https://hub.docker.com/r/ethereum/client-go)
- [wealdtech/ethereal](https://github.com/wealdtech/ethereal)
- [ethereumjs/ethereumjs-wallet: Utilities for handling Ethereum keys](https://github.com/ethereumjs/ethereumjs-wallet)

# T9 DID

製作 alice 的 DID，注意 npm 安裝時間需要比較久。

```sh
docker run -i --rm docker.io/node:16.10-alpine3.12 /bin/sh <<\EOF
npm version
apk add git curl
mkdir -p /opt/app && cd /opt/app
npm init -y 
npm install --save @digitalcredentials/did-method-key
cat <<\HERE > did.js
const didKeyDriver = require('@digitalcredentials/did-method-key').driver();
async function gendid() {
    const { didDocument, keyPairs, methodFor } = await didKeyDriver.generate();
    console.log(JSON.stringify(didDocument, null, 2));
}
async function start_server() {
    const http = require('http');
    const server = http.createServer();
    server.on('request', async (req, res) => {
        if (req.url == '/user/alice/did.json') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            const { didDocument, keyPairs, methodFor } = await didKeyDriver.generate();
            didDocument.id = 'did:web:dltdojo-cd.local:user:alice';
            res.write(JSON.stringify(didDocument, null, 2));
            res.end();
        } else {
            res.end('Invalid Request!');
        }
    });
    server.listen(8080);
}
start_server();
HERE
node did.js &
echo "127.0.0.1 dltdojo-cd.local" >> /etc/hosts
curl -sv --retry 3 --retry-delay 5 --retry-all-errors http://dltdojo-cd.local:8080/user/alice/did.json
EOF
```

- [Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/did-core/)
- [did:web Method Specification](https://w3c-ccg.github.io/did-method-web/)
- [@digitalcredentials/did-method-key - npm](https://www.npmjs.com/package/@digitalcredentials/did-method-key)

# 其他討論

docker-compose 是個方便使用的容器服務組合工具，請自行參照 [Overview of Docker Compose | Docker Documentation](https://docs.docker.com/compose/) 練習，DLTDOJO-CD 會以 kubernetes 作為服務組建調度為練習目標。



