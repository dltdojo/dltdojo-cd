[Quick Start - Argo Workflows - The workflow engine for Kubernetes](https://argoproj.github.io/argo-workflows/quick-start/)

```
k3d cluster create foo123
kubectl create ns argo
kubectl apply -n argo -f https://raw.githubusercontent.com/argoproj/argo-workflows/master/manifests/quick-start-postgres.yaml
kubectl -n argo port-forward deployment/argo-server 2746:2746
```

https://localhost:2746
