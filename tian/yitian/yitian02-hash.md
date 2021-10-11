# YiTian02 壹天貳時 hash 雜湊

各式各樣 Hello SHA3-256

- Bash + OpenSSL
- Java
- Rust
- Python

# Bash OpenSSL SHA3-256

```sh
DOCKER_BUILDKIT=1 docker build -t openssl-sha3 - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM docker.io/debian:bullseye-slim
RUN apt-get update && apt-get install -y openssl
EOF

docker run -i -w /app --rm openssl-sha3 <<\EOF
bash --version
# https://unix.stackexchange.com/questions/487028/print-sha-sums-without-at-the-end
MSG="The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"
echo -n $MSG | sha256sum | tr -d "\n *-"
echo
echo -n $MSG | openssl dgst -sha3-256 | sed 's/(stdin)= //g' | tr -d "\n"
echo
# a6d72baa3db900b03e70df880e503e9164013b4d9a470853edc115776323a098
# db8aa6c4ca3f27b80512c4ce1d94352c008a24183fde2d8bd57b4309fe670262
EOF
```


# Rust SHA3-256

```sh
DOCKER_BUILDKIT=1 docker build -t rcrypto2021 - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM rust:1.55.0-slim-bullseye
RUN cargo new app
WORKDIR /app
RUN cat <<\EOOF > Cargo.toml
[package]
name = "my_app"
version = "0.1.0"
edition = "2018"

[dependencies]
rust-crypto = "0.2.36"
EOOF
RUN cargo update && cargo build
EOF

docker run -i -w /app --rm rcrypto2021 <<\EOF
cat <<\EOOF > src/main.rs
extern crate crypto as rcrypto;
use rcrypto::digest::Digest;
use rcrypto::sha3::Sha3;
// https://docs.rs/rust-crypto/0.2.36/crypto/sha3/index.html
fn main() {
  let mut hasher = Sha3::sha3_256();
  hasher.input_str("The Times 03/Jan/2009 Chancellor on brink of second bailout for banks");
  // read hash digest
  let hex = hasher.result_str();
  assert_eq!(hex, 
      concat!("db8aa6c4ca3f27b80512c4ce1d94352c",
              "008a24183fde2d8bd57b4309fe670262"));
  println!("Hello SHA3-256")
}
EOOF
cargo run
EOF
```

- [rust-crypto - crates.io: Rust Package Registry](https://crates.io/crates/rust-crypto)


# Java

```sh
docker run -i -w /app --rm --entrypoint=/bin/bash maven:3.8.3-openjdk-11 <<\EOF
java --version
mvn --version
EOF
```

- [Gradle - Official Image | Docker Hub](https://hub.docker.com/_/gradle)
- [Maven – Maven in 5 Minutes](https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html)
- [Maven - How to create a Java project - Mkyong.com](https://mkyong.com/maven/how-to-create-a-java-project-with-maven/)


# TODO

- Python
- Ethereum
- hash function [Machine Learning in Databases Tutorial: Learned Indexes, Hash Tables, and B-Trees - Tyler Bettilyon - YouTube](https://www.youtube.com/watch?v=o1bN3gryKaw&t=1144s)