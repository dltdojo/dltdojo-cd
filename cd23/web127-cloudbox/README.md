# web127-cloudbox

專注在只用 busybox 展示於雲端原生概念故名 cloudbox 。

# 101 🎄 local pipe

- 壹開始 shell 殼上只有本機管道 [Pipeline (Unix) - Wikipedia](https://en.wikipedia.org/wiki/Pipeline_(Unix))。
- 服務利用本機應用程式如 sed, grep, wc 等以及殼上的標準輸入輸出管道轉接而成，提供單機應用組合而成的服務。
- 測試過程沒有 docker 可用時建議用下面 jslinux 有附 busybox 可用，不過瀏覽器複製貼上可能會有問題只能一行行輸入。
  - https://bellard.org/jslinux/vm.html?url=alpine-x86.cfg&mem=192
  - [9 Websites to Run Linux from Web Browser [Online Emulators]](https://geekflare.com/run-linux-from-a-web-browser/)
- 升級到 busybox 1.36 並新增 docker-compose.101.yaml

```sh
docker run -i --init --rm busybox:1.36.0 <<EOF
env
echo
cat /etc/passwd
echo
cat /etc/passwd | sed 's|bin|foo|g'
echo
cat /etc/passwd | sed 's|bin|foo|g' | grep foo
echo
cat /etc/passwd | sed 's|bin|foo|g' | grep foo | base64
echo
cat /etc/passwd | sed 's|bin|foo|g' | tee passwd2 ; cat passwd2
EOF

docker compose -f docker-compose.101.yaml up
```

# 113 🐫 update busybox, deno and wasmtime

- 這裡的 deno 與 wasmtime 只是用來展示 distoless 鏡像無其他作用，主要還是靠 busybox

```sh
docker compose -f docker-compose.113.yaml up
```
