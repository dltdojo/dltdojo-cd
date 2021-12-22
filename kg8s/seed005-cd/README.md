# seed005-cd

注意：這版無權限控制只能用於內部練習，不可改為對外服務。

- https://my-nginx.127.0.0.1.nip.io:9443
- istio addon metrics
  - https://kiali-istio-system.127.0.0.1.nip.io:9443
  - https://grafana-istio-system.127.0.0.1.nip.io:9443
  - https://prometheus-istio-system.127.0.0.1.nip.io:9443
  - https://tracing-istio-system.127.0.0.1.nip.io:9443
- gitea 
  - https://gitea.127.0.0.1.nip.io:9443
  - https://gitea.127.0.0.1.nip.io:9443/gitops-admin/seed101
- argocd
  - https://argocd.127.0.0.1.nip.io:9443
  - https://my-nginx2.127.0.0.1.nip.io:9443
- apps
  - https://vault-dev.127.0.0.1.nip.io:9443

```sh
$ just build_all foo2021
$ kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

cleanup

```sh
$ k3d cluster delete foo2021
$ sudo rm -rf $HOME/k3dvol/foo2021
```