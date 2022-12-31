# cloudbox

只用 busybox 展示於雲端原生概念故名 cloudbox 。

# 101 🎄 local pipe

- 壹開始殼上只有本機管道。
- 服務只有本機應用程式如 sed, grep, wc 等以及殼上的標準輸入輸出管道轉接。
- 沒有 docker 建議用下面 jslinux 有附 busybox 可用，不過瀏覽器複製貼上可能會有問題只能一行行輸入。
- https://bellard.org/jslinux/vm.html?url=alpine-x86.cfg&mem=192
- [9 Websites to Run Linux from Web Browser [Online Emulators]](https://geekflare.com/run-linux-from-a-web-browser/)

```sh
docker run -i --init --rm busybox:1.35.0 <<EOF
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
```

# 102 🍒 network service

- 後來出現了網路管道，這裡用 HTTP 當網路協議代表。
- Pipeline (Unix) - Wikipedia https://en.wikipedia.org/wiki/Pipeline_(Unix)
- Network socket - Wikipedia https://en.wikipedia.org/wiki/Network_socket
- Tools like netcat and socat can connect pipes to TCP/IP sockets. 

```sh
docker run -i --init --rm busybox:1.35.0 <<"EOF"
env
mkdir /home/cgi-bin
# [How to parse $QUERY_STRING from a bash CGI script? - Stack Overflow](https://stackoverflow.com/questions/3919755/how-to-parse-query-string-from-a-bash-cgi-script)
# Most trivial crack: your.host/your.cgi?rm%20-rf%20%7e <-- this will let your webserver to execute an rm -rf / :-)
cat <<"ENND" > /home/cgi-bin/sed
#!/bin/sh
eval "${QUERY_STRING//&/;}"
echo "Content-type: text/plain; charset=utf-8"
echo ""
echo -n $content | sed 's!root!foo!g'
echo ""
ENND
cat <<"ENND" > /home/cgi-bin/wc
#!/bin/sh
eval "${QUERY_STRING//&/;}"
echo "Content-type: text/plain; charset=utf-8"
echo ""
echo -n $content | wc -m
echo ""
ENND
chmod 700 /home/cgi-bin/sed
chmod 700 /home/cgi-bin/wc
httpd -fv -p 3000 -h /home &
sleep 2
echo "T1"
cat /etc/passwd | sed 's!bin!foo!g' | grep root
echo "T2"
cat /etc/passwd | sed 's!bin!foo!g' | grep root | wc -m
echo "T3"
cat /etc/passwd | sed 's!bin!foo!g' | grep root | \
  (read var1; wget -qO- "http://localhost:3000/cgi-bin/sed?content=$var1")
echo "T4"
cat /etc/passwd | sed 's!bin!foo!g' | grep root | tee /tmp/foo | \
  (read var1; wget -qO- "http://localhost:3000/cgi-bin/sed?content=$var1") | wc -m
echo "T5"
cat /etc/passwd | sed 's!bin!foo!g' | grep root | tee /tmp/foo | \
  (read var1; wget -qO- "http://localhost:3000/cgi-bin/sed?content=$var1") | tee /tmp/foo2 | \
  (read var1; wget -qO- "http://localhost:3000/cgi-bin/wc?content=$var1")
EOF
```

# 103 🚲 micro services

- 後來服務從單體開始拆分。
- 預告複雜管道管理的 service mesh （專注在網路 Networking）即將出現
- 預告可程式配置網路管道歸納出三大天王執行環境的 Multi-Runtime Microservices （Lifecycle/Networking/State/Binding）也會接續出現。
- [Multi-Runtime Microservices Architecture](https://www.infoq.com/articles/multi-runtime-microservice-architecture/)
- [如何看待 Dapr、Layotto 这种多运行时架构？_开源_周群力_InfoQ精选文章](https://www.infoq.cn/article/5n0ahsjzpdl3mtdahejx)

```sh
docker run -i --init --rm busybox:1.35.0 <<"EOF"
env
mkdir -p /home/cgi-bin
cat <<"ENND" > /home/cgi-bin/sed
#!/bin/sh
eval "${QUERY_STRING//&/;}"
echo "Content-type: text/plain; charset=utf-8"
echo ""
echo -n $content | sed 's!root!foo!g'
ENND
mkdir -p /home2/cgi-bin
cat <<"ENND" > /home2/cgi-bin/wc
#!/bin/sh
eval "${QUERY_STRING//&/;}"
echo "Content-type: text/plain; charset=utf-8"
echo ""
echo -n $content | wc -m
ENND
chmod 700 /home/cgi-bin/sed
httpd -fv -p 3000 -h /home &
chmod 700 /home2/cgi-bin/wc
httpd -fv -p 3001 -h /home2 &
sleep 3
echo "T1"
cat /etc/passwd | sed 's!bin!foo!g' | grep root
echo "T2"
cat /etc/passwd | sed 's!bin!foo!g' | grep root | wc -m
cat <<"ENND" | tee foo.sh | sed 's!|!|_service_mesh_or_mulit_runtimes_|!g' 
echo "T3"
alias sed_srv='(read var1; wget -qO- "http://localhost:3000/cgi-bin/sed?content=$var1")'
cat /etc/passwd | sed 's!bin!foo!g' | grep root | sed_srv
echo
echo "T4"
cat /etc/passwd | sed 's!bin!foo!g' | grep root | tee /tmp/foo | sed_srv | wc -m
echo "T5"
alias wc_srv='(read var1; wget -qO- "http://localhost:3001/cgi-bin/wc?content=$var1")'
cat /etc/passwd | sed 's!bin!foo!g' | grep root | tee /tmp/foo | sed_srv | tee /tmp/foo2 | wc_srv
ENND
sh foo.sh
EOF
```

output

```sh
HOSTNAME=1031a893f27d
SHLVL=1
HOME=/root
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PWD=/
T1
root:x:0:0:root:/root:/foo/sh
T2
30
echo "T3"
alias sed_srv='(read var1; wget -qO- "http://localhost:3000/cgi-bin/sed?content=$var1")'
cat /etc/passwd |_service_mesh_or_mulit_runtimes_| sed 's!bin!foo!g' |_service_mesh_or_mulit_runtimes_| grep root |_service_mesh_or_mulit_runtimes_| sed_srv
echo
echo "T4"
cat /etc/passwd |_service_mesh_or_mulit_runtimes_| sed 's!bin!foo!g' |_service_mesh_or_mulit_runtimes_| grep root |_service_mesh_or_mulit_runtimes_| tee /tmp/foo |_service_mesh_or_mulit_runtimes_| sed_srv |_service_mesh_or_mulit_runtimes_| wc -m
echo "T5"
alias wc_srv='(read var1; wget -qO- "http://localhost:3001/cgi-bin/wc?content=$var1")'
cat /etc/passwd |_service_mesh_or_mulit_runtimes_| sed 's!bin!foo!g' |_service_mesh_or_mulit_runtimes_| grep root |_service_mesh_or_mulit_runtimes_| tee /tmp/foo |_service_mesh_or_mulit_runtimes_| sed_srv |_service_mesh_or_mulit_runtimes_| tee /tmp/foo2 |_service_mesh_or_mulit_runtimes_| wc_srv
T3
foo:x:0:0:foo:/foo:/foo/sh
T4
26
T5
26
```

# 104 🍟 docker compose

- 分開成為兩個容器（各自跑 busybox httpd）
- 個別微服務獨立可使用不同版本的 busybox 當基底環境，這種微服務配置下，應用服務如 sed 與 wc 都可以調整成為不同版本因應測試、升級或佈署的彈性需求。
- 服務從 localhost 換到 box101 與 box102 ，控制容器的啟用與網路概念落在 Multi-Runtime Microservices （Lifecycle/Networking）。
- Key features and use cases | Docker Documentation https://docs.docker.com/compose/features-uses/
- Networking in Compose | Docker Documentation https://docs.docker.com/compose/networking/
- 多網路服務 104 測試的環境須使用 docker 環境，之前 101,102,103 光靠 jslinux 環境即可運行的做法不能支援 https://bellard.org/jslinux/
- busybox - Official Image | Docker Hub https://hub.docker.com/_/busybox
- docker compsoe 內需要避開 $ Docker Compose file incorrectly escaping dollar sign · Issue #9757 · docker/compose https://github.com/docker/compose/issues/9757


```sh
docker compose -f - up <<"EOF"
version: "3.8"
services:
  box101:
    image: busybox:1.35.0-glibc
    command:
      - sh
      - -c 
      - |
        env
        mkdir -p /home/cgi-bin
        cat <<"ENND" > /home/cgi-bin/sed
        #!/bin/sh
        eval "$${QUERY_STRING//&/;}"
        echo "Content-type: text/plain; charset=utf-8"
        echo ""
        echo -n $$content | sed 's|root|foo|g'
        ENND
        chmod 700 /home/cgi-bin/sed
        httpd -fv -p 3000 -h /home &
        sleep 20
        exit
  box102:
    image: busybox:1.34.1
    command:
      - sh
      - -c 
      - |
        env
        mkdir -p /home/cgi-bin
        cat <<"ENND" > /home/cgi-bin/wc
        #!/bin/sh
        eval "$${QUERY_STRING//&/;}"
        echo "Content-type: text/plain; charset=utf-8"
        echo ""
        echo -n $$content | wc -m
        ENND
        chmod 700 /home/cgi-bin/wc
        httpd -fv -p 3000 -h /home &
        sleep 20
        exit
  box103:
    image: busybox:1.35.0-musl
    command:
      - sh
      - -c 
      - |
        env
        sleep 5
        cat <<"ENND" | tee foo.sh | sed 's!|!|_docker_compose_lifecycle_networking_|!g' 
        echo "T3"
        alias sed_srv='(read var1; wget -qO- "http://box101:3000/cgi-bin/sed?content=$$var1")'
        cat /etc/passwd | sed 's!bin!foo!g' | grep root | sed_srv
        echo
        echo "T4"
        cat /etc/passwd | sed 's!bin!foo!g' | grep root | tee /tmp/foo | sed_srv | wc -m
        echo "T5"
        alias wc_srv='(read var1; wget -qO- "http://box102:3000/cgi-bin/wc?content=$$var1")'
        cat /etc/passwd | sed 's!bin!foo!g' | grep root | tee /tmp/foo | sed_srv | tee /tmp/foo2 | wc_srv
        ENND
        sh foo.sh
EOF
```

# 105 🦕 sidecar and service mesh

- service mesh 配置模式中一種是 sidecar 模式，在每個容器內做全權網路代理。
- https://en.wikipedia.org/wiki/Reverse_proxy
- docker compose 內使用 network_mode 配置網路成為所謂的 sidecar 容器，藉由該網路設定讓兩個容器成為類似 kubernetes pod 中多容器的環境。
  - network_mode: "service:[service name]"
  - network_mode: "container:[container name/id]"
  - Compose file version 3 reference | Docker Documentation https://docs.docker.com/compose/compose-file/compose-file-v3/#network_mode
  - Pods | Kubernetes https://kubernetes.io/docs/concepts/workloads/pods/
- sidecar 會有高效的 grpc 網路協定，這裡以常用的 http 示範。
- 這裡的 sidecar 需要手刻寫死代理轉傳的服務位置，常見的 service mesh 會依據標籤等設定動態完成不須手刻。
- box103 的服務網址回到之前 102 模式為本機的 localhost，不過 box103 並無啟用 httpd 服務，此即旁邊有 sidecar 容器的特徵之一。
- box103-sidecar 使用 cgi 寫可在 http url 與內容上改寫內容，概念上可實現接近 dapr service invocation 有個統一 api，而如 istio service mesh 雖說也可改寫 http 協定內容但其目的與 dapr service invocation api 不同。
- Service invocation overview https://docs.dapr.io/developing-applications/building-blocks/service-invocation/service-invocation-overview/
- Istio / Envoy Filter https://istio.io/latest/docs/reference/config/networking/envoy-filter/
- sidecar 配置的 service mesh 可以作到 istio 的五件任務。 Istio / Tasks https://istio.io/latest/docs/tasks/
  - Traffic Management: Tasks that demonstrate Istio's traffic routing features.
  - Security: Demonstrates how to secure the mesh.
  - Policy Enforcement: Demonstrates policy enforcement features.
  - Observability: Demonstrates how to collect telemetry information from the mesh.
  - Extensibility: Demonstrates how to extend mesh behavior.
- istio 五任務都可以在 box103-sidecar 上配置出來，只是你不須要自己寫這些與接這些管線。

```sh
docker compose -f docker-compose.105.yaml up
```

# 106 🍞 sidecar nginx and reverse proxy

- 兩部 sidecar 一起跑來比較
- nginx sidecar 改網址代理轉上游，觀察其中差異
  - 105 模式 http://localhost:3700/cgi-bin/srv-wc
  - 106 模式 http://localhost:3800/box102/cgi-bin/wc
- 新映像加入 nginx - Official Image | Docker Hub https://hub.docker.com/_/nginx
- NGINX Reverse Proxy | NGINX Plus https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/
- nginx 在每個容器內邊做 sidecar 的網路代理容器較少，主要是用作 http 網頁服務，這裡剛好用來做範例，其他的代理也可以用，例如 istio 的 envoy，只是配置更複雜。

```sh
docker compose -f docker-compose.106.yaml up
```

# 107 🍟 traefik

- 兩個 sidecar 模式與一個 per-host-network proxy 模式的 traefik 比較
- Traefik Routers Documentation - Traefik https://doc.traefik.io/traefik/routing/routers/
- traefik 採用打標籤方式不須設定檔如 /etc/nginx/conf.d/default.conf，只要新容器出現帶著標籤就可以轉。
- traefik 打標籤生效模式也可以用在 kubernetes 環境，類似 istio 的作法。
- Istio 打標籤不只是生出代理功能，還包含動態注入一個 sidecar 容器，也就是 box103-sidecar 與 box103-sidecar-nginx 不需要自己寫。這種打標籤動態注入 sidecar 容器的作法是目前 service mesh 主流作法。
- Istio Installing the Sidecar https://istio.io/latest/docs/setup/additional-setup/sidecar-injection/
- nginx 也可以移出來做 per-host-network 模式的 proxy
- Per-host-network 模式 eBPF or Not, Sidecars are the Future of the Service Mesh - The New Stack https://thenewstack.io/ebpf-or-not-sidecars-are-the-future-of-the-service-mesh/


```sh
docker compose -f docker-compose.107.yaml up
```

# 108 💤 istio/envoy sidecar

- istio-envoy 設定較複雜先獨立出來做 sidecar
- a service proxying HTTP from 127.0.0.1:10000 to 127.0.0.1:1234. https://www.envoyproxy.io/docs/envoy/latest/configuration/overview/examples
- Writing Envoy filters in Rust with WebAssembly https://content.red-badger.com/resources/extending-istio-with-rust-and-webassembly

```sh
docker compose -f docker-compose.108.yaml up
```


# 109 🚕🚐🛻 three sidecars

- 三台 sidecar proxy 一個 per-host proxy
- sidecars
  - busybox cgi-bin
  - nginx proxy_pass
  - istio envoy proxy

```sh
docker compose -f docker-compose.109.yaml up
```

# 110 🐱 netcat

- docker compose 試做雙向 sidecar 前面只做一邊 sidecar，這裡做兩邊 sidecar，不過兩邊不同種。
- 要注意另一邊做法不同，box101 使用 netcat 做 proxy 對外，變成 box101 置入 network_mode: service:box101-sidecar，這種模式下其他的服務無法接觸到 box101 只能透過 box101-sidecar。
- box103 也反轉之前設定變成由 box103-sidecar 對外。如果是純客戶端如 box103 類 network_mode 設定誰主外差異不大，但是服務型如 box101 就有差，設定顛倒會無法連線服務。
- netcat 轉會出現 wget 無法結束的問題，這裡設定 wget -T 1 來強制關掉連線。
- service mesh 的 sidecar 如 istion 是兩邊都配置 envoy proxy。
- 新增 netcat 做服務端與客戶端，netcat 比起 CGI 模式須做更多 http 協定的部份，換句話說從 echo HTTP/1.1 200 OK 開始。
- 把很囉唆的|_docker_compose_lifecycle_networking_|換成更簡化的 |X| 代表其中網格或複雜管道架構。
- 新增 box104-host-proxy ( 之前 traefik 設定，也類似 isito ambient mesh 的 waypoint porxy)

單體服務切分案例： docker 單一指令。

- docker Containers without Docker (podman, buildah, and skopeo) - DEV Community 👩‍💻👨‍💻 https://dev.to/cedricclyburn/containers-without-docker-podman-buildah-and-skopeo-1eal
- docker run : podman
- docker build : buildah
- docker login/inspect : skopeo

> As we’ve seen, you can use Podman, Buildah, and Skopeo as replacements to the traditional Docker workflow, without the use of a daemon or root privileges. There are plenty of great advantages that result from using these tools, and due to the increase of developer adoption there’s only more to come. I believe there’s a future for containers without Docker, and Podman (as well as the Buildah and Skopeo family) is a great alternative to work with.

不過區分微服務或子功能的代誌沒有這樣簡單，服務可以分分合合。過去 docker-compose 是一隻獨立程式，後來新版本 Docker Compose v2.0 被改寫合併到 docker 單體的 compose 子命令區，讓 docker 像 busybox 一樣單體並納入其他服務。由於 podman 需要相容 docker 故也納入 compose 功能支援，並沒有切分出 podman-compose 來做。

- Podman Compose or Docker Compose: Which should you use in Podman? | Enable Sysadmin https://www.redhat.com/sysadmin/podman-compose-docker-compose

說到單體子命令，另一個單體子命令龐大的專案是 kubernetes 界的舵手 kubectl。由於擴展需求還發展出 krew 來管理外掛。

- Command line tool (kubectl) | Kubernetes https://kubernetes.io/docs/reference/kubectl/
- kubernetes-sigs/krew: 📦 Find and install kubectl plugins https://github.com/kubernetes-sigs/krew
- Extend kubectl with plugins | Kubernetes https://kubernetes.io/docs/tasks/extend-kubectl/kubectl-plugins/

> A plugin is a standalone executable file, whose name begins with kubectl-. To install a plugin, move its executable file to anywhere on your PATH.

```sh
docker compose -f docker-compose.110.yaml up
```

# 111 🐫 distroless

- 無中生殼 distroless，busybox 官方的 docker image 建構完整的 rootfs 這裡簡化改用 dirstroless 基底。
- GoogleContainerTools/distroless: 🥑 Language focused docker images, minus the operating system. https://github.com/GoogleContainerTools/distroless
- How to Use Chainguard Images — Chainguard Academy https://edu.chainguard.dev/chainguard/chainguard-images/how-to-use-chainguard-images/
- wget: download timed out 為正常
- distroless 類基底沒帶 shell 在 docker build 無法執行 RUN 需要從 busybox 帶入。
- 複製 busybox 以及附加軟體的 distroless docker images 大小
  - busybox:1.35.0-glibc 4.8MB
  - gcr.io/distroless/static 4.6MB
  - gcr.io/distroless/base 22.4MB (glibc, libssl, openssl)
  - cgr.dev/chainguard/glibc-dynamic 7.71MB
  - gcr.io/distroless/cc-debian11 32.6MB (git, lighttpd) 
  - sandbox tools 108MB (deno)
  - sandbox tools 150MB (wasmtime, deno)
- istio ambient mesh
  - Istio / Introducing Ambient Mesh https://istio.io/latest/blog/2022/introducing-ambient-mesh/
  - HTTP tunnel - Wikipedia https://en.wikipedia.org/wiki/HTTP_tunnel#HTTP_CONNECT_Tunneling
  - HTTP-Based Overlay Network Environment (HBONE)
  - CONNECT - HTTP | MDN https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/CONNECT

```sh
docker compose -f docker-compose.111.yaml up
```

# 201 🦈 web1 composer http app to rule them all

- web1 composer = shell-app-and-http-app-composer 應用服務編排的轉化，一開始服務簡單可從單機殼上編排介接，後來服務的需求呈現爆炸性發展，服務轉換到本機殼與多機網路服務（主要是 http 協定應用服務）編排介接
- edit: sed,  wordpress
- search: grep, google
- data analysis: wc, google


# TODO

- grep mapping google echo >> index.txt
- The Web’s Next Transition | Epic Web Dev by Kent C. Dodds https://www.epicweb.dev/the-webs-next-transition
- kentcdodds/the-webs-next-transition https://github.com/kentcdodds/the-webs-next-transition
