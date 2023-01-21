# syntax=docker/dockerfile:1.3-labs

FROM gcr.io/distroless/cc-debian11 AS web127-deno-wasmtime
COPY --from=busybox:1.36.0-glibc /bin/busybox /bin/busybox
COPY --from=denoland/deno:distroless-1.29.4 /bin/deno /bin/deno
SHELL ["/bin/busybox", "sh" , "-c"]
RUN <<"ENND"
/bin/busybox --install /bin
wget -O - https://github.com/bytecodealliance/wasmtime/releases/download/v5.0.0/wasmtime-v5.0.0-x86_64-linux.tar.xz  \
	| tar -xJ wasmtime-v5.0.0-x86_64-linux/wasmtime
mv wasmtime-v5.0.0-x86_64-linux/wasmtime /bin/
ENND