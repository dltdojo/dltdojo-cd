FROM lukemathwalker/cargo-chef:latest-rust-1.59.0-bullseye AS chef
WORKDIR /app
# install just
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /bin
COPY justfile-init /app/
RUN just -f justfile-init install-kubectl

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder 
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release

FROM debian:bullseye-slim AS runtim
#FROM gcr.io/distroless/cc-debian11:debug AS runtime
WORKDIR /app
RUN apt-get update && apt-get install git curl -y
COPY --from=chef /bin/just /bin/just
COPY --from=chef /bin/kubectl /bin/kubectl
COPY --from=builder /app/target/release/napp /bin/napp
COPY . .
ENTRYPOINT ["/bin/napp"]