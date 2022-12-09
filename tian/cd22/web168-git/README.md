# 🏆 101 git docker 

- git - 維基百科，自由的百科全書 https://zh.wikipedia.org/zh-tw/Git
- alpine/git - Docker Image | Docker Hub https://hub.docker.com/r/alpine/git
- ECR Public Gallery - Bitnami/git https://gallery.ecr.aws/bitnami/git


```sh
docker run -i --init --rm --entrypoint=sh alpine/git:2.36.3 <<\EOF
git config --global user.email "foo1001@testing.local"
git config --global user.name "FooName1001"
mkdir /foo
cd /foo
echo hello-world-2022 > README.md
git init -q
git status
git add .
git status
ls -alh
git commit -m 'first commit'
git status
git log
git checkout -b issue302
git branch
echo $(date) >> README.md
git add README.md
git status
git clone /foo /foo123
cd /foo123
ls -alh
git branch
git status
git log
EOF
```

# 🎄 102 gitpod vscode

vscode 內建有 git 支援，目前版本測試時 chrome 環境會比 firefox 好，當 firefox 的 terminal 出現無法複製貼上時建議更換成 chrome 類瀏覽器。

- gitpod/openvscode-server Tags | Docker Hub https://hub.docker.com/r/gitpod/openvscode-server/tags
- dockerfile https://github.com/gitpod-io/openvscode-releases/blob/27f1d59c71c735a17eccfe6f2483bd1b6ea9d485/Dockerfile#L65


```sh
docker compose -f docker-compose.102.yaml up
```

# 📪 201 git http backend

git 如果是多方共用必須提供遠端存取協定，這裡使用簡化無權限控制的 cgi 模式的 git http backend 作法來支援 Git Http Service。


- Git - git-http-backend Documentation https://git-scm.com/docs/git-http-backend
- update_status/t5561-http-backend.sh at a5bf9d16d9f3a81329f1a7801274ad716b40c3e8 · srirammca53/update_status https://github.com/srirammca53/update_status/blob/a5bf9d16d9f3a81329f1a7801274ad716b40c3e8/git-1.7.1/t/t5561-http-backend.sh
- How to open git-http-backend as a http server? - Stack Overflow https://stackoverflow.com/questions/48472362/how-to-open-git-http-backend-as-a-http-server
- git/t5560-http-backend-noserver.sh at 623ac59239324d48943d3122c6be1a9f340f8dfb · gdb/git https://github.com/gdb/git/blob/623ac59239324d48943d3122c6be1a9f340f8dfb/t/t5560-http-backend-noserver.sh
- ynohat/git-http-backend: A dead simple, insecure git-over-http server using nginx https://github.com/ynohat/git-http-backend
- container-images/apache-git-http-backend - k8s-gerrit - Git at Google https://gerrit.googlesource.com/k8s-gerrit/+/refs/heads/master/container-images/apache-git-http-backend/

```sh
docker compose -f docker-compose.201.yaml up
```


# 📢 202 git push remote

建立兩個倉後個別讀取與寫入。使用 lighttpd + git-http-backend 配置，無權限控管。

- ryan0x44/local-git-server: A minimalistic Alpine-based Docker image for running a local HTTP Git server using Lighttpd https://github.com/ryan0x44/local-git-server
- How to test a system (in isolation) which needs to `git clone` | by Ryan D | Medium https://ryan0x44.medium.com/how-to-test-a-system-in-isolation-which-needs-to-git-clone-eec3449e6f7c

```sh
docker compose -f docker-compose.202.yaml up
```


# 🚲 203 docker compose version: git service and vscode

使用瀏覽器開啟 vscode 來執行 git 任務，不須安裝 git 環境。

- http://localhost:3000/?folder=/home/workspace/foo

```sh
docker compose -f docker-compose.203.yaml up
```


# 🚲 204 k8s version: git service and vscode  

kubernetes version：配置 git service 供遠端分享，由瀏覽器開啟 vscode 來執行 git 任務無須安裝 git 可用環境。

kubernetes 環境與 docker compose 的差異在於 Dockerfile 編譯鏡像後推送到 registry 供於 kubernetes cluster 內的 container image 可用，另外還必須加上 ingress 配置才能對外使用相對繁瑣的 yaml 配置。為了先省掉 registry 設置，直接在啟動 alpine 時下載 apk add lighttpd git-daemon 安裝。kubernetes 因為雲端原生配置機器可能不只一台，故不用本地的檔案與鏡像來配置，這樣相對開發階段遠比 docker compose 複雜，要看測試輸出結果也要 kubectl logs 不斷的找，並不是很直覺的 UX。

- vscode 無權限控管 http://vscode204.localhost:8300/?folder=/home/workspace/foo
- gitsrv 無權限控管 http://gitsrv204.localhost:8300


```sh
# k3d cluster create foo2021 -p "8300:80@loadbalancer" --agents 2
kubectl apply -f k204.yaml
```

# 🌽 301 gitops

- What Is GitOps https://www.weave.works/blog/what-is-gitops-really
- What is GitOps? https://www.redhat.com/en/topics/devops/what-is-gitops
- CI/CD Workflow using GitOps - Azure Arc-enabled Kubernetes - Azure Arc | Microsoft Learn https://learn.microsoft.com/en-us/azure/azure-arc/kubernetes/conceptual-gitops-ci-cd
- Search · gitops startuml https://github.com/search?l=PlantUML&p=2&q=gitops+startuml&type=Code
- Manage Kubernetes Objects | Kubernetes https://kubernetes.io/docs/tasks/manage-kubernetes-objects/
- Declarative Management of Kubernetes Objects Using Configuration Files | Kubernetes https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/

GitOps 流程關鍵在 No kubectl, no scripts （NKNS）這句。要注意的是 NKNSless 不意謂著沒有 kubectl+script 而是要求改寫到 git 去當成唯一的資訊源。

> You should avoid using Kubectl to update the cluster and especially avoid using scripts to group kubectl commands.  Instead, with a GitOps pipeline in place a user can update their Kubernetes cluster via Git.

![d301](d301-gitops.svg)

舉例如果需要將 k8s 系統的某一個 deployment 的 replicas 調高，這時依據 gitops 不該執行 kubectl scale deployment/nginx-deployment --replicas=10 而是提 pull request 內有 nginx-deployment yaml 新的 replicas 配置後經測試無誤在同步到 k8s 上。

換句話說也不一定是針對 k8s 系統才能做 GitOps，該流程要求系統調整時不能直接改，必須先紀錄、提交、審核、測試驗證、自動同步狀態。

為何 k8s 比較常見是因為其原生具備 Declarative Management 機制，只要 kubectl apply 即可修正狀態。



# 30x CI: argo workflow

- argo-workflows/ci.yaml at master · argoproj/argo-workflows https://github.com/argoproj/argo-workflows/blob/master/examples/ci.yaml
- argo-workflows/ci-output-artifact.yaml at master · argoproj/argo-workflows https://github.com/argoproj/argo-workflows/blob/master/examples/ci-output-artifact.yaml
- argo-workflows/buildkit-template.yaml at master · argoproj/argo-workflows https://github.com/argoproj/argo-workflows/blob/master/examples/buildkit-template.yaml



# 🍵 401 gitea

使用 git-http-backend 適合的對象是 git 這種客戶端，對於開發者需要與其他人（無安裝 git 環境）討論時需要另外的程式碼瀏覽服務與議題 issue 服務。gitea 提供額外的服務但是容器體積也變大數倍。


