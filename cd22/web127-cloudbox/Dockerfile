# syntax=docker/dockerfile:1.3-labs
FROM gcr.io/distroless/base AS web127-cbox111-base
COPY --from=busybox:1.35.0-glibc /bin/busybox /bin/busybox
SHELL ["/bin/busybox", "sh" , "-c"]
RUN <<"ENND"
/bin/busybox --install /bin
ENND

FROM gcr.io/distroless/static AS web127-cbox111-static
COPY --from=busybox:1.35.0 /bin/busybox /bin/busybox
SHELL ["/bin/busybox", "sh" , "-c"]
RUN <<"ENND"
/bin/busybox --install /bin
ENND

FROM cgr.dev/chainguard/glibc-dynamic:latest AS web127-cbox111-cgr
COPY --from=cgr.dev/chainguard/busybox:latest-glibc /bin/busybox /bin/busybox
SHELL ["/bin/busybox", "sh" , "-c"]
RUN <<"ENND"
/bin/busybox --install /bin
ENND

FROM gcr.io/distroless/static AS web127-cbox111-deno
COPY --from=busybox:1.35.0 /bin/busybox /bin/busybox
COPY --from=denoland/deno:distroless-1.29.1 /bin/deno /bin/deno
SHELL ["/bin/busybox", "sh" , "-c"]
RUN <<"ENND"
/bin/busybox --install /bin
ENND

FROM gcr.io/distroless/cc AS web127-cbox111-deno-wasmtime
COPY --from=busybox:1.35.0-glibc /bin/busybox /bin/busybox
COPY --from=denoland/deno:distroless-1.29.1 /bin/deno /bin/deno
SHELL ["/bin/busybox", "sh" , "-c"]
RUN <<"ENND"
/bin/busybox --install /bin
wget -O - https://github.com/bytecodealliance/wasmtime/releases/download/v4.0.0/wasmtime-v4.0.0-x86_64-linux.tar.xz  \
	| tar -xJ wasmtime-v4.0.0-x86_64-linux/wasmtime
mv wasmtime-v4.0.0-x86_64-linux/wasmtime /bin/
ENND

FROM debian:bullseye as web127-cbox111-builder101
RUN apt-get update && apt-get -y install git lighttpd

# https://github.com/search?l=Dockerfile&q=gcr.io%2Fdistroless%2Fbase-debian11+libz&type=Code
FROM gcr.io/distroless/cc-debian11 AS web127-cbox111-git-lighttpd
COPY --from=busybox:1.35.0-glibc /bin/busybox /bin/busybox
COPY --from=web127-cbox111-builder101 /usr/bin/git /bin/git
COPY --from=web127-cbox111-builder101 /sbin/ldconfig /bin/ldconfig
COPY --from=web127-cbox111-builder101 /lib/x86_64-linux-gnu/libz.so.* /lib/x86_64-linux-gnu/
COPY --from=web127-cbox111-builder101 /usr/lib/x86_64-linux-gnu/libpcre2-8.so.* /usr/lib/x86_64-linux-gnu/
COPY --from=web127-cbox111-builder101 /usr/sbin/lighttpd /bin/lighttpd
COPY --from=web127-cbox111-builder101 /lib/x86_64-linux-gnu/libpcre.so.* /lib/x86_64-linux-gnu/
COPY --from=web127-cbox111-builder101 /usr/lib/x86_64-linux-gnu/libnettle.so.* /usr/lib/x86_64-linux-gnu/
COPY --from=web127-cbox111-builder101 /usr/lib/x86_64-linux-gnu/libxxhash.so.* /usr/lib/x86_64-linux-gnu/
SHELL ["/bin/busybox", "sh" , "-c"]
RUN <<"ENND"
/bin/busybox --install /bin
ldconfig
ENND

FROM debian:bullseye as web127-cbox112
RUN apt update && apt install -y gcc gfortran busybox