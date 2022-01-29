# seed006-oidc

OIDC 的 IDP 端在內網私有IP環境難以正常配置，使用 vault 加上改寫 issuer 與搭配 nginx reverse-porxy 可完成 gitea/argocd 登入，反而使用 keycloak 無法配置出需要的 issuer 無法完成，只有完成 gitea，argocd 無法完成。如果可以將 OIDC IDP(keycloak,vault) 設在公開對外 IP 地方就沒有這些問題，只是公開對外 IP 需要另外配置。

注意：這版無權限控制只能用於內部練習，不可改為對外服務。

- https://my-nginx.127.0.0.1.nip.io:9443
- istio addon metrics
  - https://kiali-istio-system.127.0.0.1.nip.io:9443
  - https://grafana-istio-system.127.0.0.1.nip.io:9443
  - https://prometheus-istio-system.127.0.0.1.nip.io:9443
  - https://tracing-istio-system.127.0.0.1.nip.io:9443
- vault:
  - https://vault-dev.127.0.0.1.nip.io:9443
  - https://http-conf-vault.127.0.0.1.nip.io:9443
- gitea 
  - https://gitea.127.0.0.1.nip.io:9443
  - https://gitea.127.0.0.1.nip.io:9443/gitops-admin/seed101
- argocd
  - https://argocd.127.0.0.1.nip.io:9443
- keycloak
  - https://keycloak.127.0.0.1.nip.io:9443
- apps
  - https://my-nginx2.127.0.0.1.nip.io:9443
  - https://go-httpbin.127.0.0.1.nip.io:9443

```sh
$ just build_all foo2021
$ kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d
```

oidc setup

vault terminal

```sh
vault operator init
vault operator unseal
vault login
/opt/oidc/init-client-gitea.sh 
/opt/oidc/init-client-argocd.sh
/opt/oidc/init-provider.sh
```

設定文件可參考 vault-dev/README.md，vault 內執行指令已轉化為 script 形式。

- gitea 設定必須指明位置 : http://oidc404.vault.svc.cluster.local/v1/identity/oidc/provider/pro101/.well-known/openid-configuration
- argocd 只能指明 issuer : http://oidc404.vault.svc.cluster.local/v1/identity/oidc/provider/pro101

設定 clientid/secret 部份 gitea 有界面可以完成，argocd 需要異動 configmap 同時刪除 argocd-server 來重新讀取新的 configmap 才能生效(TODO?)。

cleanup

```sh
$ k3d cluster delete foo2021
$ sudo rm -rf $HOME/k3dvol/foo2021
```


# tools

- docker [Install Docker Engine | Docker Documentation](https://docs.docker.com/engine/install/)
- [k3d](https://k3d.io/v5.2.2/)
- kubectl [Install and Set Up kubectl on Linux | Kubernetes](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/)
- istioctl [istio/istio: Connect, secure, control, and observe services.](https://github.com/istio/istio)
- just [casey/just: 🤖 Just a command runner](https://github.com/casey/just)


```sh
sudo bash install-just.sh --to /usr/local/bin
```