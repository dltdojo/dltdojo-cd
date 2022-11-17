# GameOfEtcPasswd (GoEP) v.s. InverseGameOfEtcPasswd (IGoEP)

找坑（市勢）與造坑（市勢）

Cryptoeconomics, Token Design, and Incentives in DeFi - Tim Roughgarden - YouTube https://www.youtube.com/watch?v=_LjYvQGfxOk

# 101 GameOfEtcPasswd 找優勢策略或均衡的坑

http://localhost:8300/etc/passwd


```sh
docker run -i --init -p 8300:3000 busybox:1.35.0 <<\EOF
cat <<\EOOF > index.html
<html>
<head><title>GoEP-IGoEP 2022</title></head>
<body><h1>GameOfEtcPasswd (GoEP) v.s. InverseGameOfEtcPasswd (IGoEP)</h1></body>
</html>
EOOF
# 找優勢策略或均衡的坑
busybox httpd -fv -p 3000
EOF
```

# 102 GameOfEtcPasswd 找優勢策略或均衡的坑

Inverse EtcPasswdGameTheory 挖會形成優勢策略或均衡的坑

- http://localhost:8300/etc/passwd.html
- http://localhost:8300/cgi-bin/index.sh?path=/etc/passwd

```sh
docker run -i --init -p 8300:3000 busybox:1.35.0 <<\EOF
mkdir /www /www/cgi-bin /www/etc
cat <<\EOOF > /www/etc/passwd.html
<html>
<head>
<title>GoEP-IGoEP 2022 2022</title>
<meta http-equiv="Refresh" content="0; url='http://localhost:8300/cgi-bin/index.sh?path=/etc/passwd'" />
</head>
<body>挖會形成優勢策略或均衡的坑</body>
</html>
EOOF
cat <<\EOOF > /www/cgi-bin/index.sh
#!/bin/sh
echo "Content-Type: text/html"
echo ""
echo "$QUERY_STRING"
THEPATH=$(echo "$QUERY_STRING" | cut -d "=" -f 2)
echo "$THEPATH"
cat "$THEPATH"
EOOF
chmod 700 /www/cgi-bin/index.sh
cd /www
busybox httpd -fv -p 3000
EOF
```

# 103 curl testing

兩個並一起觀察並加上啟用 curl 容器來檢查不須開瀏覽器。新增開發體驗優化，採用檔案編輯自動更新重起的[watchexec](https://github.com/watchexec/watchexec)。不使用 watchexec 只要執行後面指令就好。

- http://localhost:8301/etc/passwd
- http://localhost:8302/etc/passwd.html
- http://localhost:8302/cgi-bin/index.sh?path=/etc/passwd


```sh
docker compose -f docker-compose.103.yaml up

watchexec -e yaml -r 'docker compose -f docker-compose.103.yaml up'
```

# 104 grafana k6 testing

對回傳進一步分析與測試，相較 103 不須人工逐一檢視結果，只要觀察最後輸出結果。k6 javascript api 與 Web APIs 有點差異，例如沒有 Request 只有 Response，而且 Response 也有點差異。

- [Request - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Request)
- [Response - Web APIs | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Response)
- [Response - k6 Javascript API](https://k6.io/docs/javascript-api/k6-http/response/)

```sh
docker compose -f docker-compose.104.yaml up
```

console output

```
web453-goep-k6-1       | running (00m01.0s), 0/1 VUs, 1 complete and 0 interrupted iterations
web453-goep-k6-1       | default ✓ [ 100% ] 1 VUs  00m01.0s/10m0s  1/1 iters, 1 per VU
web453-goep-k6-1       | 
web453-goep-k6-1       |      █ test101
web453-goep-k6-1       | 
web453-goep-k6-1       |        ✓ box1 is 200 ok
web453-goep-k6-1       |        ✓ box1 is /etc/passwd present
web453-goep-k6-1       |        ✓ box2 is 200 ok
web453-goep-k6-1       |        ✓ box2 is /etc/passwd present
web453-goep-k6-1       |        ✓ box2/etc/passwd.html is 200 ok
web453-goep-k6-1       |        ✓ box2/etc/passwd.html is meta http-requiv present
web453-goep-k6-1       |        ✓ box2 foo.sh is 200 OK
web453-goep-k6-1       |        ✓ box2 foo.sh redirect to index.sh
web453-goep-k6-1       |        ✓ box2 foo.sh is 302 Redirect
web453-goep-k6-1       |        ✓ foo.sh 302 url is correct
```

# TODO

- 2x2 games