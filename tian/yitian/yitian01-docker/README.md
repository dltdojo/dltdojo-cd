# YiTian01 壹天壹時 Docker

展開旅程前需要先收集工具，提供操控各式工具的容器化應用 Docker 為第一個需要安裝完成的工具。Docker 在各平台也不同的安裝方式請自行搜尋安裝完成。

- [Docker - 維基百科，自由的百科全書](https://zh.wikipedia.org/zh-tw/Docker)
- [Install Docker Engine | Docker Documentation](https://docs.docker.com/engine/install/)
- [Docker Tutorial for Beginners [FULL COURSE in 3 Hours] - YouTube](https://www.youtube.com/watch?v=3c-iBn73dDE)
- [Evolution of HTTP - HTTP | MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Evolution_of_HTTP#invention_of_the_world_wide_web)
- bitcoin
  - [bitcoin/bitcoin: Bitcoin Core integration/staging tree](https://github.com/bitcoin/bitcoin)
  - [ruimarinho/docker-bitcoin-core: A bitcoin-core docker image](https://github.com/ruimarinho/docker-bitcoin-core)
- ethereum
  - [ethereum/go-ethereum: Official Go implementation of the Ethereum protocol](https://github.com/ethereum/go-ethereum)
  - [ethereum/client-go - Docker Image | Docker Hub](https://hub.docker.com/r/ethereum/client-go)

# 任務

- hello-world
- 網路 HTTP 資源讀取
- 產生一個比特幣地址
- 產生一個以太坊地址

```
$ docker run hello-world
$ docker run --entrypoint curl docker.io/bitnami/kubectl:1.22 -sv http://info.cern.ch/hypertext/WWW/TheProject.html
$ docker run --entrypoint sh docker.io/ruimarinho/bitcoin-core:0.16-alpine -c "bitcoind -printtoconsole -regtest=1 & sleep 7 ; bitcoin-cli -regtest getnewaddress"
$ docker run -it docker.io/ethereum/client-go:v1.10.4 account new
$ docker run --entrypoint sh docker.io/ethereum/client-go:v1.10.4 -c "echo "TESTONLY" > pwd.txt ; geth account new --password pwd.txt"
```

# 其他討論

docker-compose 是個方便使用的容器服務組合工具，請自行參照 [Overview of Docker Compose | Docker Documentation](https://docs.docker.com/compose/) 練習，DLTDOJO-CD 會以 kubernetes 作為服務組建調度為練習目標。