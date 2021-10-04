# YiTian02 壹天貳時 數位簽章

任務

- T1 OpenSSL 製作一個 JSON Web Algorithms 的 ES256 (ECDSA using P-256 and SHA-256) 規格的數位簽章
- T2 OpenSSL 製作一個 ES256 演算法的 JSON Web Token

# T1 OpenSSL ECDSA using P-256 and SHA-256

```sh
cat <<\EOF | DOCKER_BUILDKIT=1 docker build -t openssl2021 -
# syntax=docker/dockerfile:1.3-labs
FROM docker.io/debian:9.13
RUN apt-get update && apt-get install -y openssl dumpasn1 bsdmainutils jq
EOF

docker run -i --rm openssl2021 /bin/sh <<\EOF
bash --version
set -x
openssl ecparam -list_curves
openssl ecparam -name prime256v1 -genkey -noout -out prime256v1.key
openssl ec -in prime256v1.key -pubout -out prime256v1.pubkey.pem
openssl ec -pubin -inform PEM -in prime256v1.pubkey.pem -outform DER -out prime256v1.der.pubkey
dumpasn1 prime256v1.der.pubkey
cat prime256v1.pubkey.pem
MESSAGE="The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"
echo -n $MESSAGE |openssl dgst -sha256 -binary > hash256
hexdump hash256
openssl pkeyutl -sign -inkey prime256v1.key -in hash256 > prime256v1.sig
openssl asn1parse -in prime256v1.sig -inform der
echo -n "$MESSAGE+haha" |openssl dgst -sha256 -binary > hash256-foo
openssl pkeyutl -in hash256-foo -inkey prime256v1.pubkey.pem -pubin -verify -sigfile prime256v1.sig
echo -n $MESSAGE |openssl dgst -sha256 -binary > hash256-bob
openssl pkeyutl -in hash256-bob -inkey prime256v1.pubkey.pem -pubin -verify -sigfile prime256v1.sig
EOF
```

- [Full working ECDSA signature with OpenSSL » Verschlüsselt.IT](https://xn--verschlsselt-jlb.it/full-working-ecdsa-signature-with-openssl/)
- [OpenSSL and ECDSA Signatures. Intro | by Stefan Loesch | Medium](https://medium.com/@skloesch/openssl-and-ecdsa-signatures-db60c005b1f4)
- [3.1.  "alg" (Algorithm) Header Parameter Values for JWS |  JSON Web Algorithms (JWA) | RFC7518](https://www.rfc-editor.org/rfc/rfc7518.html)

# T2 OpenSSL ES256 JWT

```sh
docker run -i --rm openssl2021 /bin/sh <<\EOF
set -x
MESSAGE="The Times 03/Jan/2009 Chancellor on brink of second bailout for banks"
JWT_HEADER_B64=$(echo -n '{"alg":"ES256","typ":"JWT"}' | base64 -w 0 | sed s/\+/-/ | sed -E s/=+$//)
JWT_PAYLOAD=$(jq -n --arg m "$MESSAGE" '{msg: $m}')
JWT_PAYLOAD_B64=$(echo $JWT_PAYLOAD | base64 -w 0 | sed s/\+/-/ | sed -E s/=+$//)
JWT_SIGN_B64=$(echo -n "$JWT_HEADER_B64.$JWT_PAYLOAD_B64" | openssl dgst -sha256 -binary -sign prime256v1.key | openssl enc -base64 | tr -d '\n=' | tr -- '+/' '-_')
JWT="$JWT_HEADER_B64.$JWT_PAYLOAD_B64.$JWT_SIGN_B64"
echo $JWT
echo ""
jq -R 'split(".") | .[0],.[1] | @base64d | fromjson' <<< "${JWT}"
# TODO openssl pkeyutl -verify
EOF
```

- [JSON Web Token - Wikipedia](https://en.wikipedia.org/wiki/JSON_Web_Token)
- [3.1.  "alg" (Algorithm) Header Parameter Values for JWS |  JSON Web Algorithms (JWA) | RFC7518](https://www.rfc-editor.org/rfc/rfc7518.html)
- [linux - How to create a Json Web Token (JWT) using OpenSSL shell commands? - Stack Overflow](https://stackoverflow.com/questions/59002949/how-to-create-a-json-web-token-jwt-using-openssl-shell-commands)
- [Generate a JWT with ECDSA keys](https://learn.akamai.com/en-us/webhelp/iot/jwt-access-control/GUID-054028C7-1BF8-41A5-BD2E-A3E00F6CA550.html)
- [ base64url issue | Decode a JWT via command line](https://gist.github.com/angelo-v/e0208a18d455e2e6ea3c40ad637aac53)

# T3 Rust ES256 JWT 

```sh
cat <<\EOF | DOCKER_BUILDKIT=1  docker build -t rustbox2021 -
# syntax=docker/dockerfile:1.3-labs
FROM rust:1.55.0-slim-bullseye as builder
RUN cargo install jwt-cli

FROM debian:bullseye-slim
RUN apt-get update && apt-get install -y curl openssl jq && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/jwt /usr/local/bin/jwt
CMD ["/bin/sh"]
EOF

docker run -i --rm rustbox2021 <<\EOF
jwt encode --secret=fake '{"nft_file":"https://ipfs.io/ipfs/Qmc5gCcjYypU7y28oCALwfSvxCBskLuPKWpK4qpterKC7z"}' |\
 jwt decode --secret=fake123 --json - | jq -r .payload.nft_file | xargs curl -sv
EOF
```

- [mike-engel/jwt-cli: A super fast CLI tool to decode and encode JWTs built in Rust](https://github.com/mike-engel/jwt-cli)
- [feat: Improved error messages/warnings by codedust · Pull Request #133 · mike-engel/jwt-cli](https://github.com/mike-engel/jwt-cli/pull/133)
- [Allow base64 encoded bytes as argument to --secret (#144) · mike-engel/jwt-cli@65afd8c](https://github.com/mike-engel/jwt-cli/commit/65afd8c969ebbf4154cb13556cd6ae4d1b9c5a0b)
- [Keats/jsonwebtoken: JWT lib in rust](https://github.com/Keats/jsonwebtoken#convert-sec1-private-key-to-pkcs8)
- [JWT authentication in Rust - LogRocket Blog](https://blog.logrocket.com/jwt-authentication-in-rust/)
- [Hello Worlds | IPFS Blog & News](https://blog.ipfs.io/0-hello-worlds/)

# TODO

- [JWT/OIDC - Auth Methods | Vault by HashiCorp](https://www.vaultproject.io/docs/auth/jwt)