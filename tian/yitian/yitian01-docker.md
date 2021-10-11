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
- T10 製作一個 HTTP 狀態與資源內容的 API Endpoint 整合性測試
- T11 製作一個公開給其他人下載使用的 Docker Image
- T12 監聽網路通訊協定 HTTP 並顯示對應之 OSI 層資訊
- T13 客製工具箱
  - ```docker run dltdojo/yitian:01```
  - ```docker run dltdojo/yitian:01-k8s```
  - ```docker run dltdojo/yitian:01-node```
  - ```docker run dltdojo/yitian:01-nmap```

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
cat <<\EOOF > /var/www/html/index.php
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
EOOF
EOF
# 
docker run --network foonet docker.io/curlimages/curl:7.79.1 -sv http://my-php:80
docker run -i --network foonet docker.io/buildkite/puppeteer:10.0.0 /bin/sh <<\EOF
cat <<\EOOF > test.js
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
EOOF
node test.js
EOF
#
docker stop my-php
docker rm my-php
docker network rm foonet
```

- [Php - Official Image | Docker Hub](https://hub.docker.com/_/php)
- [buildkite/puppeteer - Docker Image | Docker Hub](https://hub.docker.com/r/buildkite/puppeteer)
- [puppeteer/puppeteer: Headless Chrome Node.js API](https://github.com/puppeteer/puppeteer)

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

# T10 HTTP Endpoint Testing

製作一個 HTTP 狀態與資源內容的 API Endpoint 整合性測試

```sh
docker network create --driver bridge foonet
docker run -i --name didweb -p 8080:8080 --network foonet docker.io/node:16.10-alpine3.12 /bin/sh <<\EOF
apk add git curl
mkdir -p /opt/app && cd /opt/app
npm init -y  && npm install --save @digitalcredentials/did-method-key
cat <<\EOF1 > did.js
const didKeyDriver = require('@digitalcredentials/did-method-key').driver();
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
EOF1
node did.js
EOF

# sleep 60 ?

docker run -i --rm --network foonet docker.io/node:16.10-alpine3.12 /bin/sh <<\EOF
npm version
mkdir -p /opt/app && cd /opt/app
cat <<\EOF1 > package.json
{
  "name": "apitest", "version": "1.0.0", "description": "",
  "main": "main.js", "dependencies": {}, "devDependencies": {},
  "scripts": {"test": "jest"},
  "keywords": [], "author": "", "license": "ISC"
}
EOF1
npm install --save jest supertest
cat <<\EOF2 > todoapp.test.js
const supertest = require('supertest');
let request = supertest('https://jsonplaceholder.typicode.com');
describe('todo api e2e tests', () => {
    // {
    //  "userId": 1,
    //  "id": 1,
    //  "title": "delectus aut autem",
    //  "completed": false
    //  }
    test("resp status code ok", () => {
        // supertest.get().expect()
        return request.get("/todos/2")
        .expect('Content-Type', /json/)
        .expect(200).expect(function(resp){
            let r = resp.body;
            // https://jestjs.io/docs/en/expect
            expect(r.id).toBe(2);
            expect(r).toHaveProperty('id',2);
            expect(r).toHaveProperty('title');
            expect(r).toHaveProperty('userId');

        });
    });
})
EOF2
cat <<\EOF3 > alice-didweb.test.js
const request = require('supertest');
let req = request('http://localhost:8080');
describe('alice did api e2e tests', () => {
    test("resp status code ok", async () => {
        // supertest.get().expect()
        const resp = await req.get("/user/alice/did.json").set("Accept", "application/json")
            .expect("Content-Type", /json/)
            .expect(200);;
        expect(resp.statusCode).toBe(200)
        let diddoc = resp.body;
        // https://jestjs.io/docs/en/expect
        expect(diddoc.id).toBe('did:web:dltdojo-cd.local:user:alice');
        expect(diddoc).toHaveProperty('id');
        expect(diddoc.verificationMethod[0]).toHaveProperty('publicKeyMultibase');
    });
})
EOF3
npm test
EOF

docker stop didweb && docker rm didweb 
docker network rm foonet
```

- [Jest · 🃏 Delightful JavaScript Testing](https://jestjs.io/)
- [visionmedia/supertest: 🕷 Super-agent driven library for testing node.js HTTP servers using a fluent API.](https://github.com/visionmedia/supertest)
- [API Testing using Jest and SuperTest](https://www.mariedrake.com/post/api-testing-using-jest-and-supertest)
- [Endpoint testing with Jest and Supertest | Zell Liew](https://zellwk.com/blog/endpoint-testing/)
- [Testing Express Api with Jest and Supertest - DEV Community](https://dev.to/franciscomendes10866/testing-express-api-with-jest-and-supertest-3gf)

# T11 Docker Image

```sh
DOCKER_BUILDKIT=1 docker build -t foo - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM docker.io/node:16.10-alpine3.12
RUN mkdir -p /opt/app
WORKDIR /opt/app
RUN <<EOOF
cat <<\EOOOF > package.json
{
  "name": "apitest",
  "version": "1.0.0",
  "description": "",
  "main": "main.js",
  "dependencies": {},
  "devDependencies": {},
  "scripts": {"test": "jest"},
  "keywords": [],
  "author": "",
  "license": "ISC"
}
EOOOF
npm install --save jest supertest
EOOF
EOF

# tag image
docker tag foo dltdojo/jest-supertest:v0.1

# docker login
# push image
docker push dltdojo/jest-supertest:v0.1

# run dltdojo/jest-supertest
docker run -i --rm docker.io/dltdojo/jest-supertest:v0.1 /bin/sh <<\EOF
cat <<\EOOF > todoapp.test.js
const request = require('supertest');
let req = request('https://jsonplaceholder.typicode.com');
describe('todo api e2e tests', () => {
    // { "userId": 1, "id": 1, "title": "delectus aut autem", "completed": false }
    test("resp status code ok", async () => {
        // supertest.get().expect()
        const resp = await req.get("/todos/2").expect('Content-Type', /json/).expect(200);
        let r = resp.body;
        // https://jestjs.io/docs/en/expect
        expect(r.id).toBe(2);
        expect(r).toHaveProperty('title');
        expect(r).toHaveProperty('userId');
      });
});
EOOF
npm test
EOF
```

- [docker push | Docker Documentation](https://docs.docker.com/engine/reference/commandline/push/)
- [Introduction to heredocs in Dockerfiles - Docker Blog](https://www.docker.com/blog/introduction-to-heredocs-in-dockerfiles/)
- [dltdojo/jest-supertest - Docker Image | Docker Hub](https://hub.docker.com/r/dltdojo/jest-supertest)


# T12 HTTP Communication and OSI Model

```sh
DOCKER_BUILDKIT=1 docker build -t shark101 - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM docker.io/debian:bullseye-slim
RUN apt-get update && apt-get install -y openssl tshark curl
ARG TERMSHARK_VERSION=2.3.0
RUN curl -LSs https://github.com/gcla/termshark/releases/download/v${TERMSHARK_VERSION}/termshark_${TERMSHARK_VERSION}_linux_x64.tar.gz \
    -o /tmp/termshark_${TERMSHARK_VERSION}_linux_x64.tar.gz \
    &&  tar -zxvf /tmp/termshark_${TERMSHARK_VERSION}_linux_x64.tar.gz \
    &&  mv termshark_${TERMSHARK_VERSION}_linux_x64/termshark /usr/local/bin/termshark \
    &&  chmod +x /usr/local/bin/termshark
EOF

docker run -it --rm --name tmp404 shark101 termshark -i eth0 -Y http

# testing web sites
docker exec tmp404 curl http://www.apache.org
docker exec tmp404 curl http://www.w3.org
docker exec tmp404 curl http://www.google.com
docker exec tmp404 curl http://www.facebook.com
```

- [gcla/termshark: A terminal UI for tshark, inspired by Wireshark](https://github.com/gcla/termshark)
- [tshark - The Wireshark Network Analyzer 3.4.9](https://www.wireshark.org/docs/man-pages/tshark.html)
- [OSI模型 - 維基百科，自由的百科全書](https://zh.wikipedia.org/wiki/OSI%E6%A8%A1%E5%9E%8B)
- [HTTP analysis using Wireshark](https://linuxhint.com/http_wireshark/)

# T13 My Toolbox

接下來要考慮一個 [Monorepo - Wikipedia](https://en.wikipedia.org/wiki/Monorepo) 類似問題，打算做出各種專用工具的映像檔還是集中式？工具越大方便使用，但對於只需單一特定版本工具來說變成累贅，一般建議採用更新頻率低置頂集中策略來做出目前應用所需的工具箱。

```sh
DOCKER_BUILDKIT=1 docker build -t dltdojo/yitian:01 - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM docker.io/debian:bullseye-slim
ARG DEBIAN_FRONTEND=noninteractive
RUN <<\EOOF
apt-get update && apt-get install -y openssl curl jq git tree && apt-get clean
EOOF
EOF

docker images | grep dltdojo/yitian
docker run dltdojo/yitian:01 echo hello world
docker run dltdojo/yitian:01 curl --version
docker run --rm dltdojo/yitian:01 curl http://www.apache.org
docker run --rm -w /app dltdojo/yitian:01 tree -L 2 /

DOCKER_BUILDKIT=1 docker build -t dltdojo/yitian:01-k8s - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM dltdojo/yitian:01

RUN <<\EOOF
KUBECTL_VERSION=v1.22.0
curl -sL https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl -o /bin/kubectl && \
  chmod +x /bin/kubectl

KUSTOMIZE_VERSION=v4.4.0
curl -sL https://github.com/kubernetes-sigs/kustomize/releases/download/kustomize%2F${KUSTOMIZE_VERSION}/kustomize_${KUSTOMIZE_VERSION}_linux_amd64.tar.gz \
  | tar xz -C /tmp && mv /tmp/kustomize /bin/

HELM_V3=v3.7.0
curl -sSL https://get.helm.sh/helm-${HELM_V3}-linux-amd64.tar.gz | tar xz && \
  mv linux-amd64/helm /bin/helm && rm -rf linux-amd64
EOOF

ENV KUBECONFIG /kube/config
RUN mkdir -p /kube && chmod a+w /kube

RUN <<\EOOF
SKAFFOLD_VERSION=v1.32.0
curl -sLo skaffold https://storage.googleapis.com/skaffold/releases/${SKAFFOLD_VERSION}/skaffold-linux-amd64 && \
  chmod +x skaffold && mv skaffold /bin/

K3D_VERSION=5.0.0
curl -s https://raw.githubusercontent.com/rancher/k3d/main/install.sh | TAG=v$K3D_VERSION bash

curl -sLo yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 \
  && chmod +x yq && mv yq /bin/
EOOF
EOF

docker run dltdojo/yitian:01-k8s kubectl version

DOCKER_BUILDKIT=1 docker build -t dltdojo/yitian:01-node - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM dltdojo/yitian:01
ARG DEBIAN_FRONTEND=noninteractive
RUN <<\EOOF
curl -fsSL https://deb.nodesource.com/setup_14.x | bash -
apt-get install -y nodejs
EOOF
WORKDIR /tapp
RUN <<\EOOF
cat <<\EOOOF > package.json
{
  "name": "apitest", "version": "1.0.0", "description": "",
  "main": "main.js", "dependencies": {}, "devDependencies": {},
  "scripts": {"test": "jest"},
  "keywords": [], "author": "", "license": "ISC"
}
EOOOF
npm install --save jest supertest
EOOF
EOF

docker images | grep dltdojo/yitian
docker run dltdojo/yitian:01-node node -v
docker run dltdojo/yitian:01-node tree -L 2 /tapp

DOCKER_BUILDKIT=1 docker build -t dltdojo/yitian:01-nmap - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM dltdojo/yitian:01
ARG DEBIAN_FRONTEND=noninteractive
RUN <<\EOOF
apt-get update && apt-get install -y tshark nmap && apt-get clean

TERMSHARK_VERSION=2.3.0
curl -LSs https://github.com/gcla/termshark/releases/download/v${TERMSHARK_VERSION}/termshark_${TERMSHARK_VERSION}_linux_x64.tar.gz \
    -o /tmp/termshark_${TERMSHARK_VERSION}_linux_x64.tar.gz \
    &&  tar -zxvf /tmp/termshark_${TERMSHARK_VERSION}_linux_x64.tar.gz \
    &&  mv termshark_${TERMSHARK_VERSION}_linux_x64/termshark /usr/local/bin/termshark \
    &&  chmod +x /usr/local/bin/termshark
EOOF
EOF

docker images | grep dltdojo/yitian
docker run dltdojo/yitian:01-nmap nmap --version
docker run dltdojo/yitian:01-nmap termshark --version


DOCKER_BUILDKIT=1 docker build -t dltdojo/yitian:01-dlt - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM dltdojo/yitian:01
ARG DEBIAN_FRONTEND=noninteractive
RUN <<\EOOF
BITCOIND_VER=22.0
cd /tmp
curl https://bitcoincore.org/bin/bitcoin-core-${BITCOIND_VER}/bitcoin-${BITCOIND_VER}-x86_64-linux-gnu.tar.gz | tar -xz
cd /tmp/bitcoin-${BITCOIND_VER}/bin
mv bitcoind bitcoin-cli /usr/local/bin/
rm -rf /tmp/bitcoin-${BITCOIND_VER}/bin
EOOF
EOF

docker run -it --rm dltdojo/yitian:01-dlt bitcoin-cli --version

docker push dltdojo/yitian:01
docker push dltdojo/yitian:01-k8s
docker push dltdojo/yitian:01-node
docker push dltdojo/yitian:01-nmap
```

# WIP: T1x 

弱點掃描

[CVE - Download CVE List](https://cve.mitre.org/data/downloads/index.html)
[vulnersCom/nmap-vulners: NSE script based on Vulners.com API](https://github.com/vulnersCom/nmap-vulners)


```sh
cat <<\EOF | docker build -t nmap101 -
FROM docker.io/instrumentisto/nmap:7.92
RUN apk add git curl
RUN git version
WORKDIR /usr/share/nmap
RUN cd scripts && git clone --depth=1 https://github.com/scipag/vulscan
RUN cd scripts/vulscan && curl -sLO https://www.computec.ch/projekte/vulscan/download/cve.csv
EOF

docker network create --driver bridge foonet
docker run -d --name my-http -p 8081:80 --network foonet docker.io/httpd:2.4.49-alpine
docker run --rm -it --network foonet nmap101 -sV --script=vulscan/vulscan.nse my-http
docker stop my-http && docker rm my-http
docker network rm foonet
```

- [Apache Releases HTTP Server version 2.4.51 to Address Vulnerabilities Under Exploitation | CISA](https://us-cert.cisa.gov/ncas/current-activity/2021/10/07/apache-releases-http-server-version-2451-address-vulnerabilities)
- [How to Perform a Nmap Vulnerability Scan using NSE scripts](https://securitytrails.com/blog/nmap-vulnerability-scan)
- [nmap-docker-image/Dockerfile at master · instrumentisto/nmap-docker-image](https://github.com/instrumentisto/nmap-docker-image/blob/master/Dockerfile)

# 其他討論

docker-compose 是個方便使用的容器服務組合工具，請自行參照 [Overview of Docker Compose | Docker Documentation](https://docs.docker.com/compose/) 練習，DLTDOJO-CD 會以 kubernetes 作為服務組建調度為練習目標。



