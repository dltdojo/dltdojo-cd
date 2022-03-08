[Quick Start - Argo Workflows - The workflow engine for Kubernetes](https://argoproj.github.io/argo-workflows/quick-start/)

```
k3d cluster create foo123
kubectl create namespace argo

kubectl apply -n argo -f ../v3.3.0-rc4/quick-start-postgres.yaml
kubectl -n argo port-forward deployment/argo-server 2746:2746

# [Service Accounts - Argo Workflows - The workflow engine for Kubernetes](https://argoproj.github.io/argo-workflows/service-accounts/)
# Granting admin privileges
kubectl apply -f roles-admin.yaml
```

https://127.0.0.1:2746
