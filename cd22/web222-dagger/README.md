# TODO

- [dagger.io | Introducing the Dagger Node.js SDK](https://dagger.io/blog/nodejs-sdk)
- [NodeJS SDK: Execute dagger sdk from within a container: spawn Unknown system error -8 · Issue #3857 · dagger/dagger](https://github.com/dagger/dagger/issues/3857)

```sh
docker build -t dagger-nodejs .
docker run -i --init --rm -v /var/run/docker.sock:/var/run/docker.sock --entrypoint=sh dagger-nodejs <<EOF
env
docker run hello-world
EOF
```