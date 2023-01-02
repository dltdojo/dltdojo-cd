# syntax=docker/dockerfile:1.3-labs
FROM gcr.io/distroless/cc-debian11 AS web555-101
COPY --from=busybox:1.35.0-glibc /bin/busybox /bin/busybox
SHELL ["/bin/busybox", "sh" , "-c"]
RUN <<"ENND"
/bin/busybox --install /bin
wget -O - https://github.com/paritytech/substrate-contracts-node/releases/download/v0.23.0/substrate-contracts-node-linux.tar.gz | tar -xz
mv artifacts/substrate-contracts-node-linux/substrate-contracts-node /bin/
ENND