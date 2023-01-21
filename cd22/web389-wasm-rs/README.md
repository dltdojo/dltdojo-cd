# Rust and Webassembly

[Compiling from Rust to WebAssembly - WebAssembly | MDN](https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_wasm)

# 101 🌸 WebAssembly

```sh
DOCKER_BUILDKIT=1 docker build -t foo101 --target=busybox135 .
docker run -i --init --rm -p 8300:3000 foo101 <<EOF
cat <<EOOF > /www/index.html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <title>hello-wasm example</title>
  </head>
  <body>
    <script type="module">
      import init, { greet } from "/pkg/hello_wasm.js";
      init().then(() => {
        greet("WebAssembly");
      });
    </script>
  </body>
</html>
EOOF
cat <<EOOF > /etc/httpd2.conf
.wasm:application/wasm
EOOF
cat /etc/httpd2.conf
busybox httpd -fv -p 3000 -c /etc/httpd2.conf -h /www
EOF
```

注意必須調整 busybox httpd mime 輸出 foo.wasm 正確的 application/wasm 型別。

# 102 🍓 BIP39

這裡的 rust code 是預先在 Dockerfile 編譯好的。

```sh
DOCKER_BUILDKIT=1 docker build -t foo101 --target=busybox136 .
docker run -i --init --rm -p 8300:3000 foo101 <<EOF
cat <<EOOF > /www/index.html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta charset="utf-8" />
    <title>bip39 example</title>
  </head>
  <body>
    <h1>BIP39</h1>
    <script type="module">
      import init, { seed } from "/pkg/hello_wasm.js";
      init().then(() => {
        console.log(seed("狀 姜 幾 叛 客 參 鑽 搞 筒 冬 明 滲 等 零 願 由 改 儀"));
      });
    </script>
  </body>
</html>
EOOF
cat <<EOOF > /etc/httpd2.conf
.wasm:application/wasm
EOOF
cat /etc/httpd2.conf
busybox httpd -fv -p 3000 -c /etc/httpd2.conf -h /www
EOF
```

# 103 🍓 Docker compose 

同時可以動態修改 rust 與 html, javascript，只是這種動態執行 ```wasm-pack build --target web``` 編譯作法的時間會很長，只適合小程式元件少的開發測試。

```sh
docker compose -f docker-compose.103.yaml up
```

# 104 🐔 zk-STARKs cairo-rs-wasm

- [lambdaclass/cairo-rs-wasm](https://github.com/lambdaclass/cairo-rs-wasm)
- size 917MB [cypress/included - Docker Image | Docker Hub](https://hub.docker.com/r/cypress/included)
- [Check console logs | Cypress examples (v9.7.0)](https://glebbahmutov.com/cypress-examples/9.7.0/recipes/check-console-logs.html#check-at-the-end-of-the-test)
- [Using Cypress | Cypress Documentation](https://docs.cypress.io/faq/questions/using-cypress-faq#How-do-I-spy-on-console-log)

cairo-rs-wasm 的自動化測試需檢視 browser console log，需要設定大容量的內建瀏覽器的網頁測試工具 cypress 。

build

```sh
cd /tmp
git clone https://github.com/lambdaclass/cairo-rs-wasm
cd cairo-rs-wasm
wasm-pack build --target=web
mv pkg $PATH_WEB389/r104/pkg/
mv index.html $PATH_WEB389/r104/
```

running

```sh
docker run -i --init -p 8300:3000 --rm -v $PWD/r104:/home:ro busybox:1.35.0 <<EOF
echo http://localhost:8300
cat <<EOOF > /etc/httpd.conf
.wasm:application/wasm
EOOF
busybox httpd -fv -p 3000 -c /etc/httpd.conf -h /home
EOF
```

running http service and cypress testing

```
docker compose -f docker-compose.104.yaml up
```

# 105 🍟 speedup docker dev

為了加速開發勢必需要安裝 rust 於本機開發無法只使用 docker 編譯好，不過使用 docker 於 rust 編譯建議使用特別工具快取，否則會產生超級大檔與不斷地重新拉取導致延遲。

- [Compiling from Rust to WebAssembly - WebAssembly | MDN](https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_wasm)
- [Cache Rust dependencies with Docker build and lib.rs - Stack Overflow](https://stackoverflow.com/questions/72213346/cache-rust-dependencies-with-docker-build-and-lib-rs)
- [LukeMathWalker/cargo-chef: A cargo-subcommand to speed up Rust Docker builds using Docker layer caching.](https://github.com/LukeMathWalker/cargo-chef)
- [Chef tries to build my backend (musl) deps for wasm when I build the frontend · Issue #166 · LukeMathWalker/cargo-chef](https://github.com/LukeMathWalker/cargo-chef/issues/166)
- wasm-pack build cache 無效原因待查。
- http://localhost:8300

```sh
# cargo install wasm-pack
# cargo new --lib r105
docker compose -f docker-compose.105.yaml up
```

兩種編譯作法如下，wasm 安裝只是複製檔案無其他相依性套件或平台考量，105-1 適合 CI 環境需要自完（不太可能讓你安裝各種套件與版本）編譯產生 wasm 環境，105-2 則適合本機已安裝 wasm-pack 開發。

```dockerfile
FROM chef-105 AS builder-105
COPY --from=planner-105 /app/recipe.json recipe.json
RUN cargo chef cook --release --target wasm32-unknown-unknown --recipe-path recipe.json
COPY r105/. .
RUN wasm-pack build --release --target web
#
FROM busybox:1.35.0 AS busybox-105-1
WORKDIR /www
COPY --from=builder-105 /app/pkg /www/pkg
COPY --from=builder-105 /app/index.html /www/index.html
#
FROM busybox:1.35.0 AS busybox-105-2
WORKDIR /www
COPY r105/pkg /www/pkg
COPY r105/index.html /www/index.html
```

# 106 🍟 wasm and CORS

busybox http 服務 wasm 需要解決 mime 之外還有 cors 要處理。直接用 [How to set header with busybox httpd - Server Fault](https://serverfault.com/questions/918602/how-to-set-header-with-busybox-httpd) 其中的 cgi 方式可行但需要改 wasm 與 js 路徑複雜容易出錯。故考慮由 busybox 設定 wasm 部份，其餘的 javascript 還是留在 html 端。


```sh
docker compose -f docker-compose.106.yaml up
```

cors jpg cors 參考範例。

```sh
# https://github.com/dcmartin/addon-motion-video0/blob/a6537775ae7d7242e5ce18a9dc4588ff8ff42bc5/motion-video0/rootfs/var/www/localhost/cgi-bin/jpg#L32
echo "Content-Type: application/wasm"
echo "Access-Control-Allow-Origin: *"
echo "Cache-Control: no-cache"
echo "Cache-Control: max-age=30"
echo ""
cat foo.wasm
```

# 107 🚲 wasm, javascript and CORS

將 106 版本的 js 移到 wasm 同一位置。因為這與 wasm 黏合的膠水 js 還是比較適合放在一起。不過這樣靠 cgi 來服務要改的地方多一個。

```sh
docker compose -f docker-compose.107.yaml up
```

# 108 📢 nginx cors

另一種方式使用可以支援配置 CORS 的 nginx

- [nginx - Official Image | Docker Hub](https://hub.docker.com/_/nginx)
- [enable cross-origin resource sharing](https://enable-cors.org/server_nginx.html)

```sh
docker compose -f docker-compose.108.yaml up
```

# 109 🍒 traefix witout cors

反向代理可以省去 CORS 配置，但需要多配置一個代理服務，這裡選用可動態偵測配置的 traefik 來作。

- http://localhost:8701

```sh
docker compose -f docker-compose.109.yaml up
```

# 110 🎄 nginx proxy_pass

採用固定設定檔的 nginx 來測試。這方式與 traefik 動態看標籤不同，如有異動如要重新配置設定檔後重新啟動。相較於 busybox httpd 的精簡配置，nginx 的配置檔比較豐富完整，不過越多功能越不易配置，例如反向代理如涉及路徑變更比較複雜。還有如 worker_processes 之類的設定，原先在單機環境可能正常，到了虛擬環境有些設定開始不準需要手動調整或是找到新的設定。

- http://localhost:8702
- [Auto-tune worker_processes ? · Issue #31 · nginxinc/docker-nginx](https://github.com/nginxinc/docker-nginx/issues/31)
- [Memory limits in compose specification v3 vs. docker-compose · Issue #14185 · docker/docs](https://github.com/docker/docs/issues/14185)
- 使用 cpu_count 設定 worker_processes  auto 還是不準，直接改成單一執行 process。

```sh
docker compose -f docker-compose.110.yaml up
```