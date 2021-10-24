# nushell

```sh
docker run -it --rm quay.io/nushell/nu:nightly (too old 0.21.0 now 0.38.0)

docker build -t nu - <<\EOF
FROM rust:1.56.0-bullseye AS chef
RUN cargo install nu

# distroless image size 102 MB
# FROM gcr.io/distroless/cc
# COPY --from=chef /lib/x86_64-linux-gnu/libz.so.1 /lib/x86_64-linux-gnu/

# bullseye-slim image size 265 MB
FROM debian:bullseye-slim AS runtime
RUN apt-get update && apt-get install -y git openssl curl jq
COPY --from=chef /usr/local/cargo/bin/nu /bin/nu
COPY --from=chef /usr/local/cargo/bin/nu_plugin_core_match /bin/nu_plugin_core_match
ENTRYPOINT ["/bin/nu"]
EOF

docker run -it --rm nu -v
───┬────────────────────┬────────────────────────────────────────────────────────
 # │      Column0       │                        Column1                         
───┼────────────────────┼────────────────────────────────────────────────────────
 0 │ version            │ 0.38.0                                                 
 1 │ build_os           │ linux-x86_64                                           
 2 │ rust_version       │ rustc 1.56.0 (09c42c458 2021-10-18)                    
 3 │ rust_channel       │ 1.56.0-x86_64-unknown-linux-gnu (default)              
 4 │ cargo_version      │ cargo 1.56.0 (4ed5d137b 2021-10-04)                    
 5 │ pkg_version        │ 0.38.0                                                 
 6 │ build_time         │ 2021-10-24 08:16:23 +00:00                             
 7 │ build_rust_channel │ release                                                
 8 │ features           │ ctrlc, dataframe, default, rustyline, term, which, zip 
 9 │ installed_plugins  │                                                        
───┴────────────────────┴────────────────────────────────────────────────────────

docker run -it --rm nu -c "sys | get host"
docker run -it --rm nu -c "fetch https://jsonplaceholder.typicode.com/todos/1"
docker run -it --rm nu -c "fetch https://jsonplaceholder.typicode.com/todos/1 | select userId title"
docker run -i --rm nu <<\EOF
char newline
let payload = [[title, body, userId];["foo title", "bar body", 1]]
$payload | to json
char newline
let post_id = ( $payload | post https://jsonplaceholder.typicode.com/posts $in )
$post_id
char newline
$post_id | get id | $in + 1
char newline
$"hello post id ( $post_id | get id | $in + 1 )"
char newline
$payload | update body $"hello post id ( $post_id | get id | $in + 1 )"
char newline
let new_poid = ([[title, body, userId];["foo title", "bar body", 1]] | post https://jsonplaceholder.typicode.com/posts $in | get id | $in + 1 )
[[title, body, userId];["another post", $"hello post id ($new_poid)", 1]] | to json
EOF
```

- [Nushell demo - try the CLI in the browser](https://www.nushell.sh/demo/)
- [HTTP | Nushell](https://www.nushell.sh/cookbook/http.html)
- [Initial docker command impl by JonnyWalker81 · Pull Request #695 · nushell/nushell](https://github.com/nushell/nushell/pull/695)
- [Plugins | Nushell](https://www.nushell.sh/contributor-book/plugins.html#creating-a-plugin-in-rust)
- [Search · UntaggedValue Primitive](https://github.com/search?l=Rust&q=UntaggedValue+Primitive&type=Code)
- [nushell/crates at main · nushell/nushell](https://github.com/nushell/nushell/tree/main/crates)
- [tidwall/gjson.rs: Get JSON values quickly - JSON parser for Rust](https://github.com/tidwall/gjson.rs)
- https://github.com/nushell/nushell/blob/72c241348ba0b16518ff307ce818a797367a41e3/crates/nu_plugin_query_json/src/query_json.rs#L50