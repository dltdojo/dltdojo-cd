# seed009-workflow

目標為 justfile 轉換為 argo workflow yaml



# install

對外可連線的 IP 對應到 DNS 名稱的作法與 [Knative](https://knative.dev/docs/install/serving/install-serving-with-yaml/#configure-dns) 一致採用 Magic DNS (sslip.io)。

```sh
# update_dns_suffix old_suffix new_suffix
# update_ssl_port dns_suffix old_port new_port
# $ just update_dns_suffix 127.0.0.1.sslip.io 192.168.123.1.sslip.io
# $ just update_ssl_port 192.168.123.1.sslip.io 9443 443
$ just build_all bar008 192.168.123.1.sslip.io 443
```

## vault

vault 存放密碼資料需先啟動後取得 seal key 後解封後，設定 k8s 與 keycloak/gitea 需要的資料。

https://vault-dev.127.0.0.1.sslip.io

```
vault operator init
vault operator unseal
vault login
sh /opt/sh/config-k8s-inject.sh
```

## keyclaok

之前版本 keycloak 管理員登入寫在 keycloak/kustomization.yaml，在CI為明碼僅供測試除錯，目前改寫在 vault /secret101/keycloak 內。

vault 設定完成後需先執行 ```just krestart_keycloak``` 來重起讀入新的設定。

keycloak UI 無法匯出 realm 全部設定所以無法直接用來匯入設定。

- keycloak 
  - login https://keycloak.127.0.0.1.sslip.io
  - create a realm blue101
  - oidc configuration : https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101/.well-known/openid-configuration
  - oidc issuer (只與 realm 有關，與個別 odic client 無關) : https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101
- keycloak realm blue101
  - create Client ID: client101
  - Root URL: null
  - Access Type: confidential
  - Valid Redirect URIs: 
    - https://gitea.127.0.0.1.sslip.io/*
    - https://argocd.127.0.0.1.sslip.io/*
    - https://grafana-istio-system.127.0.0.1.sslip.io/*
    - https://kiali-istio-system.127.0.0.1.sslip.io/*
    - https://my-nginx.127.0.0.1.sslip.io/*
    - https://httpbin.127.0.0.1.sslip.io/*
- realm blue101: client 101 Client Scopes
  - Client Mapper
    - name: groups
    - type: Group Membership
    - Token Claim Name: groups
    - Full group path: OFF
    - Add to ID token: ON
    - Add to Access token: ON
    - Add to userinfo: ON
- realm blue101: Groups
  - argocd-admin
  - grafana-viewer
  - grafana-editor
  - grafana-admin
  - httpbin-viewer
  - httpbin-editor
  - httpbin-admin
- realm blue101: Users
  - alice (alice@dev.local)
  - bob (bob@dev.local)

## gitea oidc setup

需要先取得 client secret 並設定到 vault secret101/gitea 內。

vault 設定完成後需先執行 ```just krestart_gitea``` 來重起讀入新的設定。

https://gitea.127.0.0.1.sslip.io

gitea 的 OIDC 登入與管理員的 gitea-credentials 都改用 vault inject，更改 client secret 需要到 vault 界面進行。

也可以 gitea UI 手動新增 gitea auth provider，不過預設安裝時已經綁定 vault ，要注意可能手動新增第二個會出現問題。

- 網站管理 - 認證來源 /admin/auths
  - 認證類型： oauth2
  - Oauth2 提供者：OpenID Connect
  - Client ID: client101
  - Clinet Secret: from keyclaok client101
  - OpenID Discovery URL: https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101/.well-known/openid-configuration

注意如果對外設定是 443，keycloak 的 issuer 輸出不會有 443 這樣會導致 jwt 驗證 issuer 不一致出錯，所以必須與 openid-configuration 完全一致不帶 :443。同理 keycloak 設定的 redirect_uri 許可也跟是否有 :443 有關。

## argocd oidc setup

https://argocd.127.0.0.1.sslip.io

argocd 設定在 argocd/argocd-cm.yaml 的 oidc.config 設定，與 kustomization argocd-secret。

- issuer: https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101
- clientID: $oidc.client101.clientID
- clientSecret: $oidc.client101.clientSecret

argocd 支援對應到 kubernetes secret 欄位的前置 $ 寫法， $oidc.client101.clientSecret 對應到 argocd-secret 這個 secret 下面的 oidc.client101.clientSecret 欄位。

權限分類只有 admin 與一般使用者，設定使用者在 argocd-admin 的 keycloak realm pro101 群組內即可。

因為 argocd 的 configmap 為固定非 kustomize 產出，修改 oidc.config 不會觸發 argocd 更新需要先手動改 patch-argocd-server.yaml labels/version 為不同版號來觸發更新。

異動兩個檔案後執行 ```just kapply_argocd```

## grafana oidc steup

https://grafana-istio-system.127.0.0.1.sslip.io

異動 grafana-cm 資料不會觸發 grafana pod 更新，需要更新 patch-grafana.yaml labels/version 來觸發重新讀取 configmap。

修改 istio-metrics/kustomization.yaml

grafana.ini 內可以設定 client_id 與 client_secret，不過這樣無法對應到單一 kubernetes secret 需用 env 來對應，需要修改 kustomization/secret/oidc-credentials 對應到下面兩個 env var。

- GF_AUTH_GENERIC_OAUTH_CLIENT_ID
- GF_AUTH_GENERIC_OAUTH_CLIENT_SECRET

修改 istio-metrics/grafana-cm/grafana.ini

- auth_url = https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101/protocol/openid-connect/auth
- token_url = https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101/protocol/openid-connect/token
- api_url = https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101/protocol/openid-connect/userinfo

異動檔案後執行 ```just kapply_istio_metrics```

## kiali

https://kiali-istio-system.127.0.0.1.sslip.io

修改 istio-metrics/kustomization.yaml

kiali 不像 argocd 可以用 env 對應到 kubernetes secret，只能用 oidc-secret 限定檔案名稱，無法類似 argocd 可在 secret 內改寫 oidc client-id。

修改 istio-metrics/patch-kiali.yaml

- issuer_uri: https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101

kiali 需要綁定 kubernetes 來做分群權限，這裡不做權限分群，如要分群可用下面 httpbin + opa 範例修改。

異動檔案後執行 ```just kapply_istio_metrics```

## httpbin

https://httpbin.127.0.0.1.sslip.io

httpbin 預設沒有支援 OIDC 模式，使用 oauth2-proxy 來支援，並使用 envoy filter 來加入 open policy agent 做分群權限設定。

修改 oidc client secret 於 auth/oauth2-proxy/kustomization.yaml，因為 kustomize 會更動 secret 名稱並觸發 oauth2-proxy 更新，所以這個案例可以不需更新 pod 的版號也會聯動重新建立。

執行 ```just kapply_auth```

對於需要放在 oauth2-proxy 之後的 workload 需要加上標籤 ```oauth2-istio-injection: enabled``` 後重新建立 pod。

分群權限參考 auth/opa/policy101.rego 針對 httpbin 分成三種群組控制使用。對於需要加入權限控管的 workload 需加上標籤  ```opa-istio-injection: enabled``` 重新建立 pod。

另外對比 https://my-nginx.127.0.0.1.sslip.io 只有 oauth2-proxy 無 opa 權限控管。

## system restart

- patch coredns rewrite : ```just kpatch_coredns_rewrite```
- unseal vault: https://vault-dev.127.0.0.1.sslip.io

## cleanup

```sh
$ k3d cluster delete bar007
$ sudo rm -rf $HOME/k3dvol/foo2021
```

# links

- OIDC IDP: https://keycloak.127.0.0.1.sslip.io:443
- OIDC Client:
  - https://gitea.127.0.0.1.sslip.io:443 
  - https://argocd.127.0.0.1.sslip.io:443
  - https://grafana-istio-system.127.0.0.1.sslip.io:443
  - https://kiali-istio-system.127.0.0.1.sslip.io:443 
  - https://my-nginx.127.0.0.1.sslip.io:443
  - https://httpbin.127.0.0.1.sslip.io:443
  - kubernetes (提供紀錄不配置)

OIDC 的 IDP 端在內網私有IP環境難以正常配置，使用 vault 加上改寫 issuer 與搭配 nginx reverse-porxy 可完成 gitea/argocd 登入，反而使用 keycloak 無法配置出需要的 issuer 無法完成，只有完成 gitea，argocd 無法完成。如果可以將 OIDC IDP(keycloak,vault) 設在公開對外 IP 地方就沒有這些問題，只是公開對外 IP 需要另外配置，或是使用配合 coredns 與 port 設定以及在 oidc client 掛載自簽根憑證來完成。

目前更改 coredns 會因為重起等因素還原成預設值，需要執行 ```just kpatch_coredns_rewrite``` 重設。

注意：權限控制未完善只能用於內部練習，不可改為對外服務。

服務網址

- istio addon metrics
  - https://kiali-istio-system.127.0.0.1.sslip.io:443
  - https://grafana-istio-system.127.0.0.1.sslip.io:443
  - https://prometheus-istio-system.127.0.0.1.sslip.io:443
  - https://tracing-istio-system.127.0.0.1.sslip.io:443
- vault:
  - https://vault-dev.127.0.0.1.sslip.io:443
- gitea 
  - https://gitea.127.0.0.1.sslip.io:443
  - https://gitea.127.0.0.1.sslip.io:443/gitops-admin/seed101
- argocd
  - https://argocd.127.0.0.1.sslip.io:443
- keycloak
  - https://keycloak.127.0.0.1.sslip.io:443
- apps
  - https://my-nginx.127.0.0.1.sslip.io:443
  - https://my-nginx2.127.0.0.1.sslip.io:443
  - https://httpbin.127.0.0.1.sslip.io:443
  - https://go-httpbin.127.0.0.1.sslip.io:443

# k3s 1.22 and coredns customization

[[Release-1.22] Feature: Add CoreDNS Customization Options by dereknola · Pull Request #4860 · k3s-io/k3s](https://github.com/k3s-io/k3s/pull/4860)

目前改為新版但是測試無效

```
--image docker.io/rancher/k3s:v1.22.5-k3s2
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