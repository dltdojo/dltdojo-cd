# WIP: YiTian0x Kubernetes


任務

- T1 建立一個 kubernetes cluster 使用 kubectl 執行  job 後刪除 cluster
- 建立一個 docker 內 kubectl 執行 job 的範例並用終端機模式檢視 kubernetes 資源
- 建立一個 Web 界面操作之 kubectl 執行 job 範例（檢視資源？）
- 建立 http 服務並使用 job 來測試輸出結果
- 建立 http 服務並使用 pod 來測試輸出結果
- 建立一個 hyperledger fabric 網路


# T1 Kubernetes and kubectl

下載安裝 [kubectl](https://kubernetes.io/docs/tasks/tools/) 與 [rancher/k3d](https://github.com/rancher/k3d) 或是直接使用 docker 來執行不須下載 kubectl。

建立 cluster

```sh
k3d version
k3d cluster create foo2021

kubectl version
# wait coredns ready
kubectl rollout status -n kube-system deployment.apps/coredns
# create a job
JOB_NAME=hello-$(date +%s | sha256sum | head -c 8 ; echo)
kubectl create job ${JOB_NAME} --image=busybox -- echo "Hello World $(date)"
kubectl get pods --all-namespaces
kubectl wait --for=condition=complete job/${JOB_NAME} --timeout=60s
echo "Job output:"
kubectl logs job/${JOB_NAME}

k3d cluster delete foo2021
```

如要繼續使用這個 kubernetes cluster 可不執行 ```k3d cluster delete foo2021``` 讓後面沿用。

- [Overview of kubectl | Kubernetes](https://kubernetes.io/docs/reference/kubectl/overview/)

# T2 docker and kubectl

```sh
# k3d cluster create foo2021

docker run -i --rm -v ${HOME}/.kube/config:/kube/config:ro \
  --network host dltdojo/yitian:01-k8s <<\EOF
kubectl config set current-context k3d-foo2021
kubectl version && kubectl config view && kubectl config current-context
JOB_NAME=hello-$(date +%s | sha256sum | head -c 8 ; echo)
kubectl create job ${JOB_NAME} --image=busybox -- echo "Hello World $(date)"
kubectl get pods --all-namespaces
kubectl wait --for=condition=complete job/${JOB_NAME} --timeout=60s
echo "Job output:"
kubectl logs job/${JOB_NAME}
EOF

# k9s 
docker run -it --rm -v ${HOME}/.kube/config:/kube/config:ro --network host dltdojo/yitian:01-k8s k9s

# k3d cluster delete foo2021
```

關於 ```dltdojo/yitian:01-k8s``` 說明在 yitian01-docker.md 內。

一開始使用 [bitnami-docker-kubectl/Dockerfile](https://github.com/bitnami/bitnami-docker-kubectl/blob/master/1.21/debian-10/Dockerfile) 會有 ```USER 1001``` 與掛載使用者之間的權限問題，需將 host 端的 uid/gid 對應上去避開，另設唯讀 ```/.kube/config:ro``` 避免改到 host 系統的 kube/config，因為開發系統有多叢集運行，需要先設定 context 來執行，注意 k3d 需前置 ```k3d-```，job 名稱附加亂數避免同名撞擊。

kubernetes 執行一次性的工作可與 ```docker run --rm busybox echo "Hello World"``` 比較相對複雜。

- [Use volumes | Docker Documentation](https://docs.docker.com/storage/volumes/)
- [Organizing Cluster Access Using kubeconfig Files | Kubernetes](https://kubernetes.io/docs/concepts/configuration/organize-cluster-access-kubeconfig/)


# Kubectl Web UI

```
docker run -it --init -p 3000:3000 -v "$(pwd):/home/project:cached" theiaide/theia:next
```

- [theia-ide/theia-apps: Theia applications examples - docker images, desktop apps, packagings](https://github.com/theia-ide/theia-apps)
- [Kubernetes – Open VSX Registry](https://open-vsx.org/extension/ms-kubernetes-tools/vscode-kubernetes-tools)
- [theia-apps/theia-rust-docker at master · theia-ide/theia-apps](https://github.com/theia-ide/theia-apps/tree/master/theia-rust-docker)


- VisualStudio Code
  - git extensions
  - k8s extensions

# HTTP service and curl testing

```sh
docker run -i --rm -v ${HOME}/.kube/config:/.kube/config:ro \
  -u $(id -u):$(id -g) --entrypoint /bin/bash --network host bitnami/kubectl:1.22 <<\EOF
mkdir /tmp/.kube && cp /.kube/config /tmp/.kube/config
export KUBEHOME="/tmp/.kube"
export KUBECONFIG=$KUBEHOME/config
kubectl config set current-context k3d-foo2021
kubectl config current-context

cat <<\CORE | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-t2 # http://nginx-t2.default
spec:
  selector:
    app: nginx
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
CORE

#
# wait for niginx-t2 ready
#
JOB_NAME=test-$(date +%s | sha256sum | head -c 8 ; echo)
kubectl create job ${JOB_NAME} --image=docker.io/curlimages/curl:7.79.1 -- curl -sv --retry 3 --retry-delay 10 http://nginx-t2.default
kubectl get pods --all-namespaces
kubectl wait --for=condition=complete job/${JOB_NAME} --timeout=60s
echo "Job output:"
kubectl logs job/${JOB_NAME}
EOF
```

## curl testing deployment


```sh
docker run -i --rm -v ${HOME}/.kube/config:/.kube/config:ro \
  -u $(id -u):$(id -g) --entrypoint /bin/bash --network host bitnami/kubectl:1.22 <<\EOF
mkdir /tmp/.kube && cp /.kube/config /tmp/.kube/config
export KUBEHOME="/tmp/.kube"
export KUBECONFIG=$KUBEHOME/config
kubectl config set current-context k3d-foo2021
kubectl config current-context

DEPLOY_NAME=curl-$(date +%s | sha256sum | head -c 8 ; echo)
cat <<CORE | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${DEPLOY_NAME}
  labels:
    app: curl
spec:
  replicas: 1
  selector:
    matchLabels:
      app: curl
  template:
    metadata:
      labels:
        app: curl
    spec:
      containers:
      - name: curl
        image: docker.io/curlimages/curl:7.79.1
        command: [/bin/sh]
        args:
          - -ce
          - |
            date
            env
            curl -s --retry 3 --retry-delay 10 http://nginx-t2.default.svc.cluster.local
            tail -f /dev/null
CORE
#
kubectl rollout status deploy/${DEPLOY_NAME} --timeout=10s
kubectl logs deploy/${DEPLOY_NAME} 
echo
echo ===  Run curl in first Pod and first container in Deployment  ===
echo
kubectl exec deploy/${DEPLOY_NAME} -- curl -sv http://nginx-t2.default.svc.cluster.local          
kubectl exec deploy/${DEPLOY_NAME} -- env
kubectl delete deploy/${DEPLOY_NAME} 
EOF
```


# skaffold 

```docker build|run``` 轉到 kubernetes 變成使用 ```skaffold build|run``` 為何不只是使用 sh + kubectl ？ 因為可以簡化很多寫 sh 錯誤，可開```skaffold run -vdebug```來看看這些工作有可以用 sh 完成只是要考慮後續維護問題。

```sh
DOCKER_BUILDKIT=1 docker build -t k102s - <<\EOF
# syntax=docker/dockerfile:1.3-labs
FROM k101s
RUN <<\EOOF
SKAFFOLD_VERSION=v1.32.0
curl -sLo skaffold https://storage.googleapis.com/skaffold/releases/${SKAFFOLD_VERSION}/skaffold-linux-amd64 && \
  chmod +x skaffold && mv skaffold /bin/

K3D_VERSION=5.0.0
curl -s https://raw.githubusercontent.com/rancher/k3d/main/install.sh | TAG=v$K3D_VERSION bash

curl -sLo yq https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 \
  && chmod +x yq && mv yq /bin/
EOOF
EOF

docker run -i --rm -v ${HOME}/.kube/config:/kube/config:ro \
  -v /var/run/docker.sock:/var/run/docker.sock --network host k102s <<\EOF
cat <<\EOOF > Dockerfile
FROM golang:1.15 as builder
COPY main.go .
ARG SKAFFOLD_GO_GCFLAGS
RUN go build -gcflags="${SKAFFOLD_GO_GCFLAGS}" -o /app main.go

FROM alpine:3
ENV GOTRACEBACK=single
CMD ["./app"]
COPY --from=builder /app .
EOOF

cat <<\EOOF > k8s-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: getting-started
spec:
  containers:
  - name: getting-started
    image: skaffold-example
EOOF

cat <<\EOOF > main.go
package main

import (
  "fmt"
  "time"
)

func main() {
  for {
	  fmt.Println("Hello dltdojo-cd 2021!")
	  time.Sleep(time.Second * 1)
	}
}
EOOF

cat <<\EOOF > skaffold.yaml
apiVersion: skaffold/v2beta23
kind: Config
build:
  artifacts:
  - image: skaffold-example
deploy:
  kubectl:
    manifests:
      - k8s-*
EOOF

ls -al
skaffold run --tail
EOF

# docker ps
# docker stop CONTAINER_ID
```

這個設定不需要 push image 所以可以避開一開始要先有 image registy 類服務，直接將 image tarball 匯入 [k3d image import](https://k3d.io/usage/commands/k3d_image_import/)，如果 ```skaffold run -vdebug``` 可以看到 ```Importing images from tarball '/k3d/images/k3d-foo2021-images-20211007085633.tar' into node 'k3d-foo2021-server-0'``` 這類訊息。

另外不直接用 gcr.io/k8s-skaffold/skaffold 是因為太過肥大需 2.77GB 以及內建的 kubectl 版本過舊。

# WIP: 

> An SSL error has occurred and a secure connection to the server cannot be made. [SHAKESPEARE QUOTE OF THE DAY](https://www.google.com/search?q=SHAKESPEARE+QUOTE)


- [An SSL error has occurred and a secure connection to the server cannot be made. error is seen in iOS 10 devices. · Issue #27 · google/gtm-http-fetcher](https://github.com/google/gtm-http-fetcher/issues/27)
- [Secure connection failed and Firefox did not connect | Firefox Help](https://support.mozilla.org/en-US/kb/secure-connection-failed-firefox-did-not-connect)

# WIP: Hyperledger Fabric

- [Kubectl plugins available · Krew](https://krew.sigs.k8s.io/plugins/)
- [kfsoftware/hlf-operator: Hyperledger Fabric Kubernetes operator - Hyperledger Fabric operator for Kubernetes (v2.2+)](https://github.com/kfsoftware/hlf-operator)