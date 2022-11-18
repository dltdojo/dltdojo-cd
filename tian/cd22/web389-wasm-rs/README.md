# Rust and Webassembly

[Compiling from Rust to WebAssembly - WebAssembly | MDN](https://developer.mozilla.org/en-US/docs/WebAssembly/Rust_to_wasm)

# 🌸 101 WebAssembly

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

# 🍓 102 BIP39

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

# 🍓 103 Docker compose 

同時可以動態修改 rust 與 html, javascript，只是這種動態執行 ```wasm-pack build --target web``` 編譯作法的時間會很長，只適合小程式元件少的開發測試。

```sh
docker compose -f docker-compose.103.yaml up
```