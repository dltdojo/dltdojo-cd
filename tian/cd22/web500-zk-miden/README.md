# zk-STARKs Miden VM

[maticnetwork/miden: STARK-based virtual machine](https://github.com/maticnetwork/miden)

# 🍓 101

221123 瀏覽器無法執行

```sh
cargo new --lib zk101
cd zk101
# update Cargo.toml src/lib.rs
wasm-pack build --target web

docker run -i --init -p 8300:3000 --rm -v $PWD:/home:ro busybox:1.35.0 <<EOF
echo http://localhost:8300
cat <<EOOF > /etc/httpd.conf
.wasm:application/wasm
EOOF
busybox httpd -fv -p 3000 -c /etc/httpd.conf -h /home
EOF
```

