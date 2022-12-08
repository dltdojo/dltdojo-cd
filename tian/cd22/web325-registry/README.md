# container image registry

Using k3d-managed registries https://k3d.io/v5.2.1/usage/registries/#testing-your-registry

# 🌤️ 101 k3d host local registry

k3d 建立的 registry 在 pull/push 網址須注意 kubernetes 內外與 push/pull 之間差別：

- 在 k3d cluster 之外： docker push （主機端）或是 k8s yaml pull image 欄位為 k3d-registry101.localhost:12345
- 在 k3d cluster 之中： buildkit push 為 k3d-registry101.localhost:5000

如果是外部公開網址的 registry 不會有這類內外名稱差異問題，內部自建好處是測試方便，特別是快速測試 CI/CD 流程。

建立 registry 為 k3d-registry101.localhost:12345 / k3d-registry101.localhost:5000 並測試 docker push 後 kubectl run

```sh
k3d registry create registry101.localhost --port 12345
k3d cluster create foo2021 --registry-use k3d-registry101.localhost:12345
docker ps
docker tag busybox:1.35.0 k3d-registry101.localhost:12345/mybox:v0.1
docker push k3d-registry101.localhost:12345/mybox:v0.1
curl -sv k3d-registry101.localhost:12345/v2/_catalog
kubectl run foobox202 --image k3d-registry101.localhost:12345/mybox:v0.1 -- sh -c "env && date"
sleep 3
kubectl logs foobox202
```

佈署後進入 kubernetes 內測試出現 curl -sv http://192.168.64.2:5000/v2/ 正常，curl -sv http://k3d-registry101.localhost:5000/v2/ 異常。執行 nslookup 正常。

```sh
/ # nslookup k3d-registry101.localhost
Server:         10.43.0.10
Address:        10.43.0.10:53

Name:   k3d-registry101.localhost
Address: 192.168.64.2


/ # curl -sv http://192.168.64.2:5000/v2/
*   Trying 192.168.64.2:5000...
* Connected to 192.168.64.2 (192.168.64.2) port 5000 (#0)
> GET /v2/ HTTP/1.1
> Host: 192.168.64.2:5000
> User-Agent: curl/7.86.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Content-Length: 2
< Content-Type: application/json; charset=utf-8
< Docker-Distribution-Api-Version: registry/2.0
< X-Content-Type-Options: nosniff
< Date: Wed, 07 Dec 2022 03:28:12 GMT
< 
* Connection #0 to host 192.168.64.2 left intact

/ # curl -sv http://k3d-registry101.localhost:5000/v2/
*   Trying 127.0.0.1:5000...
* connect to 127.0.0.1 port 5000 failed: Connection refused
*   Trying [::1]:5000...
* connect to ::1 port 5000 failed: Connection refused
* Failed to connect to k3d-registry101.localhost port 5000 after 0 ms: Couldn't connect to server
* Closing connection 0

/ # nslookup k3d-registry101.localhost | awk 'NR==6 {print $2}'
192.168.64.2
```

moby/buildkit buildctl-daemonless.sh 於 k8s 內測試 output 到 k3d-registry101.localhost:5000 成功，kubectl run 需要改用 k3d-registry101.localhost:12345。

- k8s內網： k3d-registry101.localhost:5000/mybox:v1.3
- k8s主機或 yaml image 欄： k3d-registry101.localhost:12345/mybox:v1.3

```sh
cat <<EOF | sh
kubectl apply -f push101.yaml
sleep 20
echo "=== k run buildkit ==="
kubectl logs buildkit100
echo "=== k run curl ==="
kubectl logs curl987
echo "=== k run k3d-registry101.localhost:12345 ==="
kubectl run foo501 --image k3d-registry101.localhost:12345/mybox:v1.3
sleep 5
kubectl logs foo501
kubectl delete po foo501
kubectl delete -f push101.yaml
EOF
```

# 🌄 102 from local registry

- Hope to support configuration pull for all insecure repositories · Issue #3089 · moby/buildkit https://github.com/moby/buildkit/issues/3089

直接衍生新鏡像編譯出問題。

```
echo "FROM k3d-registry101.localhost:12345/mybox:v102" > /workspace/Dockerfile
```

出現下列錯誤。

```
error: failed to solve: k3d-registry101.localhost:12345/mybox:v102: failed to do request: 
Head "https://k3d-registry101.localhost:12345/v2/mybox/manifests/v102": dial tcp 192.168.80.2:12345: 
connect: connection refused
```

需要刪除舊 cluster 配置新設定 registry-config 測試 mirrors 還是無效。

```sh
cat <<EOF > registry102.yaml
mirrors:
  "k3d-registry101.localhost:12345":
    endpoint:
      - http://k3d-registry101.localhost:12345
EOF
k3d cluster create foo2021 --registry-use k3d-registry101.localhost:12345 --registry-config registry102.yaml
kubectl apply -f push102.yaml
kubectl logs buildkit101
kubectl logs buildkit102
```

結果無效，buildctl-daemonless.sh 執行還是會找上 https，如何使用主機的 http registry 當成 FROM 對象有待其他方案。

針對多重複雜的 Dockerfile 要用 k3d 配置的 registry 只能在外部利用 docker build 之後 tag 在 push 上去。或是使用具有 https 與公開 ip 的私有 registry。


# 🍏 103 multistage build

單一檔案編譯兩個鏡像，加入環境變數調整。

- HTTP API V2 | Docker Documentation https://docs.docker.com/registry/spec/api/
- moby/buildkit: concurrent, cache-efficient, and Dockerfile-agnostic builder toolkit https://github.com/moby/buildkit
- Clean up finished jobs automatically | Kubernetes https://kubernetes.io/docs/concepts/workloads/controllers/job/#clean-up-finished-jobs-automatically
- shell - While loop to test if a file exists in bash - Stack Overflow https://stackoverflow.com/questions/2379829/while-loop-to-test-if-a-file-exists-in-bash

```sh
# k3d registry create registry101.localhost --port 12345
# k3d cluster create foo2021 --registry-use k3d-registry101.localhost:12345
kubectl apply -f build103.yaml
kubectl get job
kubectl logs job/build103 build-box
kubectl logs job/build103 build-box-curl
```

# 🍟 104 ConfigMaps

把 Dockerfile 與配置版本參數提到 ConfigMaps。

- ConfigMaps | Kubernetes https://kubernetes.io/docs/concepts/configuration/configmap/

```sh
# k3d registry create registry101.localhost --port 12345
# k3d cluster create foo2021 --registry-use k3d-registry101.localhost:12345
kubectl apply -f build104.yaml
kubectl get job
kubectl logs job/build103 build-box
kubectl logs job/build103 build-box-curl
kubectl run foo101 --image=k3d-registry101.localhost:12345/abox-curl:3.17.0-2 -- sh -c "curl --version"
kubectl logs foo101 ; kubectl delete po foo101
kubectl run foo101 --image=k3d-registry101.localhost:12345/abox-gitsrv:3.17.0-2 -- sh -c "git --version"
kubectl logs foo101 ; kubectl delete po foo101
```

# 測試失敗紀錄：901/902 不建議 k3d 的 k8s 內部建立 local registry

改成內建 registry 於 kubernetes 內，則是可以成功內推到 registry101.default.svc.cluster.local:5000，使用 curl 檢驗沒問題，但是對 k3d 配置來看 kubectl run 執行時找不到 image。

```sh
kubectl apply -f push901.yaml
kubectl run foo203 --image registry101.default.svc.cluster.local:5000/mybox:v1.2 && sleep 3 && kubectl logs foo203
kubectl delete -f push901.yaml
```

不只是內部找到，外部也要找到。不過這樣設定還是失敗，需要加上其他配置才能使用內部 registry，因配置複雜不建議。

- registry101.default.svc.cluster.local:5000/mybox:v1.3
  - push-in-cluster ok
  - curl ok
- registry101.localhost:8081/mybox:v1.3
  - curl ok
  - kubectl run imagepullerrror


```sh
cat <<EOF > registry.yaml
mirrors:
  "registry505.localhost":
    endpoint:
      - http://registry101.localhost:8081
EOF
k3d cluster create foo2021 --registry-config registry.yaml -p "8081:80@loadbalancer" --agents 2
kubectl apply -f push902.yaml
curl -sv http://registry101.localhost:8081/v2/_catalog
kubectl run foo205 --image registry505.localhost/mybox:v1.3
# ImagePullError
```