# container image registry

Using k3d-managed registries https://k3d.io/v5.2.1/usage/registries/#testing-your-registry


# 101 docker registry

內部建立 registry

```sh
k3d cluster create foo2021
kubectl apply -f k101.yaml
```

# 20x k3d registry

```sh
k3d registry create registry101.localhost --port 12345
docker ps
docker tag busybox:1.35.0 k3d-registry101.localhost:12345/mybox:v0.1
docker push k3d-registry101.localhost:12345/mybox:v0.1
k3d cluster create foo2021 --registry-use k3d-registry101.localhost:12345
kubectl run foobox202 --image k3d-registry101.localhost:12345/mybox:v0.1 -- sh -c "env && date"
sleep 3
kubectl logs foobox202
```

build-push on k8s

- https://github.com/moby/buildkit#imageregistry
- buildkit/job.privileged.yaml at master · moby/buildkit https://github.com/moby/buildkit/blob/master/examples/kubernetes/job.privileged.yaml

內部 build push 失敗，無法從內部 push image，找不到 k3d-registry101.localhost:12345

```sh
kubectl apply -f job20x.yaml
```