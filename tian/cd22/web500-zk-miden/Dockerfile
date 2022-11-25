# syntax=docker/dockerfile:1.3-labs
FROM rust:1.65.0 AS builder101
WORKDIR /app
RUN cargo install wasm-pack
RUN <<EOF
env
cargo new --lib hello-wasm
cd hello-wasm
cat <<EOOF > src/lib.rs
use wasm_bindgen::prelude::*;
#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
}
#[wasm_bindgen]
pub fn greet(name: &str) {
    alert(&format!("Hello, {}!", name));
}
EOOF
cat <<EOOF > Cargo.toml
[package]
name = "hello-wasm"
version = "0.1.0"
edition = "2021"
[lib]
crate-type = ["cdylib"]
[dependencies]
wasm-bindgen = "0.2.83"
console_error_panic_hook = "0.1.7"
miden-prover = { git = "https://github.com/maticnetwork/miden", tag = "v0.3.0",  default-features = false}
miden-assembly = {  git = "https://github.com/maticnetwork/miden",  tag = "v0.3.0" ,default-features = false}
EOOF
wasm-pack build --target web
EOF