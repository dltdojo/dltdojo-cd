# k8s

基於 docker 環境最容易建構 kubernetes 的是 k3d。測試前建立 cluster。

```sh
k3d cluster create foo2021
```

測試完將 cluster 刪除。

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


# 🍅 105 apps/v1 deployment

採用 kuberctl create 生成方式會自帶 app 標籤。

```sh
docker compose -f docker-compose.105.yaml up
```

# 🍇 106 apps/v1 service nodeport

測試 nodeport 需要建立時對應出來，下面配置外面是 8082，因為 k3d 是在 docker 內運行模擬等於又轉一次。也可以直接 30080:30080 設定，不過這樣會不清楚網路位置。

- Exposing Services - k3d https://k3d.io/v5.4.6/usage/exposing_services/

```sh
k3d cluster create foo2021 -p "8082:30080@agent:0" --agents 2
docker compose -f docker-compose.106.yaml up
```

# 🍆 107 networking.k8s.io/v1 ingress

注意觀察 whoami 可以發現兩次使用不同的 ip 的容器來服務。另外使用 traefik 作 ingress 並加上 middleware stripPrefix 將路徑轉成內部服務。

- https://doc.traefik.io/traefik/v2.0/providers/kubernetes-ingress/
- https://doc.traefik.io/traefik/routing/providers/kubernetes-ingress/
- https://doc.traefik.io/traefik/middlewares/http/stripprefix/

```sh
k3d cluster create foo2021 -p "8081:80@loadbalancer" --agents 2
docker compose -f docker-compose.107.yaml up
```


# 20x Bad Pods

[Bad Pods: Kubernetes Pod Privilege Escalation | Bishop Fox](https://bishopfox.com/blog/kubernetes-pod-privilege-escalation)