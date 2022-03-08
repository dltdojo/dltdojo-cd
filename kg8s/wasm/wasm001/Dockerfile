FROM lukemathwalker/cargo-chef:latest-rust-1.59.0 AS chef
WORKDIR /app

FROM chef AS planner
# cargo install foo-app to /usr/local/cargo/bin/foo-app
# RUN cargo install just --version 1.0.1
RUN curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash -s -- --to /bin
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

FROM chef AS builder 
COPY --from=planner /app/recipe.json recipe.json
RUN cargo chef cook --release --recipe-path recipe.json
COPY . .
RUN cargo build --release

# FROM debian:bullseye-slim AS runtim
FROM gcr.io/distroless/cc-debian11:debug AS runtime
WORKDIR /app
COPY --from=planner /bin/just /bin/just
COPY --from=builder /app/target/release/wapp /bin/app
ENTRYPOINT ["/bin/app"]