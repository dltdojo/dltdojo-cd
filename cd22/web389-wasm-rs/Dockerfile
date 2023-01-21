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
wasm-bindgen = "0.2"
EOOF
wasm-pack build --target web
EOF

FROM builder101 AS builder102
RUN <<EOF
cd /app/hello-wasm
cat <<EOOF > src/lib.rs
use wasm_bindgen::prelude::*;
use bip39::{Language, Mnemonic, MnemonicType, Seed};
#[wasm_bindgen]
pub fn seed(phrase: &str) -> Box<[u8]> {
  let mnemonic = Mnemonic::from_phrase(phrase, Language::ChineseTraditional).unwrap();
  let seed = Seed::new(&mnemonic, "");
  let seed_bytes: &[u8] = seed.as_bytes();
  // print the HD wallet seed as a hex string
  // println!("{:X}", seed);
  seed_bytes.to_vec().into_boxed_slice()
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
tiny-bip39 = "1.0.0"
getrandom = { version = "0.2", features = ["js"] }
EOOF
wasm-pack build --target web
EOF

FROM busybox:1.35.0 AS busybox135
WORKDIR /www
COPY --from=builder101 /app/hello-wasm/pkg /www/pkg
# busybox httpd -fv -p 3000 -c /etc/xxx.conf -h /www

FROM busybox:1.35.0 AS busybox136
WORKDIR /www
COPY --from=builder102 /app/hello-wasm/pkg /www/pkg
# busybox httpd -fv -p 3000 -c /etc/xxx.conf -h /www

FROM rust:1.66 AS chef-105
RUN cargo install cargo-chef && cargo install wasm-pack
RUN rustup target add wasm32-unknown-unknown
WORKDIR /app

FROM chef-105 AS planner-105
COPY r105/. .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef-105 AS builder-105
COPY --from=planner-105 /app/recipe.json recipe.json
# Build dependencies - this is the caching Docker layer!
RUN cargo chef cook --release --target wasm32-unknown-unknown --recipe-path recipe.json
# Build application
COPY r105/. .
RUN wasm-pack build --release --target web

FROM busybox:1.35.0 AS busybox-105-1
WORKDIR /www
COPY --from=builder-105 /app/pkg /www/pkg
COPY --from=builder-105 /app/index.html /www/index.html

FROM busybox:1.35.0 AS busybox-105-2
WORKDIR /www
COPY r105/pkg /www/pkg
COPY r105/index.html /www/index.html
