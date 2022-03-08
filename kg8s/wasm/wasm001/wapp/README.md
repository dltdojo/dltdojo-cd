build

```
cargo build --target wasm32-wasi
wasmtime target/wasm32-wasi/debug/wapp.wasm -- -h
```