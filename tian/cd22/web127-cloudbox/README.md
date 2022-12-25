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

# TODO

- grep mapping google echo >> index.txt