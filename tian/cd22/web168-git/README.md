# 101 git docker 

local clone

# 10x gitpod vscode

目前版本測試時 chrome 環境會比 firefox 好，當 firefox 的 terminal 出現無法複製貼上時建議更換成 chrome 類瀏覽器。

- git - 維基百科 https://zh.wikipedia.org/zh-tw/Git
- gitpod/openvscode-server Tags | Docker Hub https://hub.docker.com/r/gitpod/openvscode-server/tags
- dockerfile https://github.com/gitpod-io/openvscode-releases/blob/27f1d59c71c735a17eccfe6f2483bd1b6ea9d485/Dockerfile#L65


# 📪 201 git http backend

- Git - git-http-backend Documentation https://git-scm.com/docs/git-http-backend
- update_status/t5561-http-backend.sh at a5bf9d16d9f3a81329f1a7801274ad716b40c3e8 · srirammca53/update_status https://github.com/srirammca53/update_status/blob/a5bf9d16d9f3a81329f1a7801274ad716b40c3e8/git-1.7.1/t/t5561-http-backend.sh
- How to open git-http-backend as a http server? - Stack Overflow https://stackoverflow.com/questions/48472362/how-to-open-git-http-backend-as-a-http-server
- git/t5560-http-backend-noserver.sh at 623ac59239324d48943d3122c6be1a9f340f8dfb · gdb/git https://github.com/gdb/git/blob/623ac59239324d48943d3122c6be1a9f340f8dfb/t/t5560-http-backend-noserver.sh
- ynohat/git-http-backend: A dead simple, insecure git-over-http server using nginx https://github.com/ynohat/git-http-backend
- container-images/apache-git-http-backend - k8s-gerrit - Git at Google https://gerrit.googlesource.com/k8s-gerrit/+/refs/heads/master/container-images/apache-git-http-backend/

```sh
docker compose -f docker-compose.201.yaml up
```


# 📢 202 git push

建立兩個倉後個別讀取與寫入。使用 lighttpd + git-http-backend 配置，無權限控管。

- ryan0x44/local-git-server: A minimalistic Alpine-based Docker image for running a local HTTP Git server using Lighttpd https://github.com/ryan0x44/local-git-server
- How to test a system (in isolation) which needs to `git clone` | by Ryan D | Medium https://ryan0x44.medium.com/how-to-test-a-system-in-isolation-which-needs-to-git-clone-eec3449e6f7c

```sh
docker compose -f docker-compose.202.yaml up
```


# 🚲 203 git and vscode

使用瀏覽器開啟 vscode 來執行 git 任務，不須安裝 git 環境。

```sh
docker compose -f docker-compose.203.yaml up
```

# 🌽 301 gitops

- Manage Kubernetes Objects | Kubernetes https://kubernetes.io/docs/tasks/manage-kubernetes-objects/
- Declarative Management of Kubernetes Objects Using Configuration Files | Kubernetes https://kubernetes.io/docs/tasks/manage-kubernetes-objects/declarative-config/


# 30x CI: argo workflow

- argo-workflows/ci.yaml at master · argoproj/argo-workflows https://github.com/argoproj/argo-workflows/blob/master/examples/ci.yaml
- argo-workflows/ci-output-artifact.yaml at master · argoproj/argo-workflows https://github.com/argoproj/argo-workflows/blob/master/examples/ci-output-artifact.yaml
- argo-workflows/buildkit-template.yaml at master · argoproj/argo-workflows https://github.com/argoproj/argo-workflows/blob/master/examples/buildkit-template.yaml



# 🍵 401 gitea

使用 git-http-backend 適合的對象是 git 這種客戶端，對於開發者需要與其他人（無安裝 git 環境）討論時需要另外的程式碼瀏覽服務與議題 issue 服務。gitea 提供額外的服務但是容器體積也變大數倍。


