# Development

```
cargo install just
just install-dev-deps
just watch
```

jsdoc : docs/gen 

```
jsdoc -c docs/jsdoc.json
```


# mdbook, devserver livereload websocket

[docker / serve / WebSocket connection to 'ws://0.0.0.0:3000/__livereload' failed: bad URL · Issue #1698 · rust-lang/mdBook](https://github.com/rust-lang/mdBook/issues/1698)

wasm 有下載問題，但是單一 port 很好用
lomirus/live-server: Launch a local network server with live reload feature for static pages.
https://github.com/lomirus/live-server

wasm browser 沒問題但是佔用兩 port 而且 ws 寫死無法多開
kettle11/devserver: A simple HTTPS server for local development. Implemented in Rust.
https://github.com/kettle11/devserver

https://github.com/kettle11/devserver/search?q=8129

Hot-reload html pages · Issue #112 · thecoshman/http
https://github.com/thecoshman/http/issues/112

這個不太像 不過類似只用一個 port 
davidpdrsn/axum-live-view: Real-time user experiences with server-rendered HTML
https://github.com/davidpdrsn/axum-live-view

自己裝

[Rust:axum学习笔记(7) websocket - 菩提树下的杨过 - 博客园](https://www.cnblogs.com/yjmyzz/p/axum_tutorial_7_websocket.html)

加上嵌入 https://github.com/kettle11/devserver/blob/70c88649ebf2d4a4d2ee9f91621f081d573fa638/devserver_lib/src/reload.html

