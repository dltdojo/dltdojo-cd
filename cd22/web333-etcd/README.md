# etcd

[etcd-io/etcd: Distributed reliable key-value store for the most critical data of a distributed system](https://github.com/etcd-io/etcd)

# 🍣 101 docker 

```sh
docker run -i --init --entrypoint=sh quay.io/coreos/etcd:v3.5.6 <<EOF
etcdctl -h
etcd &
sleep 2
etcdctl put key101 value101
sleep 2
etcdctl get key101 
etcdctl get -w json key101
EOF
```

# 🍧 102 docker compose and etcdctl watch

```sh
docker compose -f docker-compose.102.yaml up
```

# 🍰 103 nodejs version

```sh
docker compose -f docker-compose.103.yaml up
```

# 🍱 104 golang version

```sh
docker compose -f docker-compose.104.yaml up
```

# 🍪 105 dockerfile

將 nodejs/golang 反覆下載的部份移到 Dockerfile 產生的鏡像之中。

```sh
docker compose -f docker-compose.105.yaml build
docker compose -f docker-compose.105.yaml up
```