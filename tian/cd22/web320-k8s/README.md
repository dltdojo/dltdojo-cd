# k8s

before

```sh
k3d cluster create foo2021
```

end

```sh
k3d cluster delete foo2021
```

# 🍣 101 deploy a pod (docker)

alpine/k8s - Docker Image | Docker Hub https://hub.docker.com/r/alpine/k8s

設唯讀 /.kube/config:ro 避免改到 host 系統的 kube/config，因為開發系統有多叢集運行，需要先設定 context 來執行，注意 k3d 需前置 k3d。

```sh
docker run -i --init --rm -v ${HOME}/.kube/config:/.kube/config:ro \
  --entrypoint /bin/sh --network host alpine/k8s:1.25.4 <<\EOF
export KUBEHOME="/.kube"
export KUBECONFIG=$KUBEHOME/config
kubectl config set current-context k3d-foo2021
kubectl version && kubectl config view && kubectl config current-context
kubectl get nodes
kubectl run nginx101 --image nginx
sleep 10
kubectl get pods
sleep 3
kubectl delete pods nginx101
sleep 3
kubectl get pods
EOF
```

# 🍤 102 deploy a pod (docker compose)

開啟兩個容器一起測，利用 kubectl run 啟動容器

```sh
docker compose -f docker-compose.102.yaml up
```

# 🍥 103 pod's yaml

使用 yaml 啟動容器

```sh
docker compose -f docker-compose.103.yaml up
```

# 🍨 104 apps/v1 ReplicaSet

```sh
docker compose -f docker-compose.104.yaml up
```
