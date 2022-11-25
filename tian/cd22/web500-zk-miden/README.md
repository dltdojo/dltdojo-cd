# zk-STARKs Miden VM

[maticnetwork/miden: STARK-based virtual machine](https://github.com/maticnetwork/miden)

# 🍓 101 begin push.6 push.5 add end

```sh
cargo new --lib zk101
cd zk101
# update Cargo.toml src/lib.rs
wasm-pack build --target web
```

單獨使用 docker 後開啟瀏覽器測試 ```begin push.6 push.5 add end```

```sh
docker run -i --init -p 8300:3000 --rm -v $PWD/zk101:/home:ro busybox:1.35.0 <<EOF
echo http://localhost:8300
cat <<EOOF > /etc/httpd.conf
.wasm:application/wasm
EOOF
busybox httpd -fv -p 3000 -c /etc/httpd.conf -h /home
EOF
```

# 🐕 102 browser console log testing

只測試最後壹行。起於 HTML 內發出 ```begin push.6 push.5 add end``` 傳入 webassembly 後計算回傳，在於 cypress 中自動分析 console log 確認輸出結果。添加 cypress 減少人工反覆開啟檢視 console log 的流程，以及大量測試不同瀏覽器版本的工作。

```sh
docker compose -f docker-compose.102.yaml up 
```

# 🐘 103 one yaml to rule them all

直接在一個 yaml 內修改調整 rust, html, javascript , testing 等。不過反覆的安裝 wasm-pack 與編譯 miden 太花時間還是移到 dockerfile 完成，所以其實是 dockerfile+docker-compose-yaml to rule them all. 

```sh
docker compose -f docker-compose.103.yaml up 
```


