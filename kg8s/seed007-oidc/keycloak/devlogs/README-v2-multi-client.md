# setup

k8s 內如何實現 https://keycloak.127.0.0.1.nip.io:9443 轉到 https://keycloak-http.keycloak.svc.cluster.local:9443 有幾個地方要修改。

- coredns 對應 keycloak.127.0.0.1.nip.io 到 keycloak-http.keycloak.svc.cluster.local 參考 [Custom DNS Entries For Kubernetes](https://coredns.io/2017/05/08/custom-dns-entries-for-kubernetes/)
- keycloak 使用 https svc port 必須與對外一致，原設定為 8443 需改為 9443 這樣 issuer 才會與對外的 authorization_endpoint 一致。

## keycloak

- https://keycloak.127.0.0.1.nip.io:9443
- realm : pro101
- oidc configuration : https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101/.well-known/openid-configuration
- oidc issuer (只與 realm 有關，與個別 odic client 無關) : https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101

issuer 內容為 public_key 與對應網址，要取得 id_token 需要提供相關的登入資訊與 response_type=id_token 如下。

```
curl -sk https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101
{
  "realm": "pro101",
  "public_key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmd8hoYDmfOsHjuzPkMCO18R8gDH1j+8SyMsvN56yn2czTDRCI0gI7DXI+EMwGrAVAMD5P8nWEh7c4zP5u8duUkdHqLnur0G8EpYccTNCCJxanz0FWvgz4JyZnCnnZZ5BS8w+Ti6YPFvO/GKk4nQYeACCWb8IK81/jdrvGfhRs7Bib4JpwdBEnA0FFYuAOPplZEDyOuH0Ix8ekT7ETQ9z1lkwbuHti3JzLGLC8gT/xichUtrX6rCL3A90PUanEDSTAws05FvtCQdrP88TbOcyYxzGMJPyT4IFjW5x/XDTD6oyk5jSHF4AzS8KV9xgye3kjrzArzookHhr88u+fJTfOwIDAQAB",
  "token-service": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101/protocol/openid-connect",
  "account-service": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101/account",
  "tokens-not-before": 1641261693
}

# access_token and id_token
curl -sk -X POST https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101/protocol/openid-connect/token  \
  -d grant_type=password \
  -d client_id=gitea101 \
  -d username=alice \
  -d password=alicepass \
  -d client_secret=9gh83hPKPzKKhL9uAhHHPAUjKMXJjrUJ \
  -d scope=openid \
  -d response_type=id_token | jq .

{
  "access_token": "eyJhbGci...DJtztCbmB-w",
  "expires_in": 300,
  "refresh_expires_in": 1800,
  "refresh_token": "eyJhbGciOiJIUz...jdDS4",
  "token_type": "Bearer",
  "id_token": "eyJhbGciOiJSUzI1...fag",
  "not-before-policy": 1641261693,
  "session_state": "6364e34c-23e4-4f02-8c87-47a99850407e",
  "scope": "profile email"
}

```


## gitea 

- keycloak gitea client
  - Client ID: gitea101
  - Root URL: https://gitea.127.0.0.1.nip.io:9443
  - Access Type: confidential
  - Valid Redirect URIs: https://gitea.127.0.0.1.nip.io:9443/*
  - Base URL: /
- gitea auth provider
  - client id: gitea101
  - OpenID Discovery URL: https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101/.well-known/openid-configuration

開始測試會遭遇 oidc client(gitea/argocd) 不接受自簽憑證的問題。 

> Failed to initialize OpenID Connect Provider with name 'keycloak' with url 'https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101/.well-known/openid-configuration': Get "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101/.well-known/openid-configuration": x509: certificate is not valid for any names, but wanted to match keycloak.127.0.0.1.nip.io

- [Remove or provide a way to disable ssl validation on creation of OAuth2 provider · Issue #17867 · go-gitea/gitea](https://github.com/go-gitea/gitea/issues/17867)
- [Search · self-signed](https://github.com/go-gitea/gitea/search?q=self-signed&type=issues)
- [Received cert error when configuring AroCD SSO to use OIDC with self signed certificate · Issue #4344 · argoproj/argo-cd](https://github.com/argoproj/argo-cd/issues/4344)

這問題需在 oidc-idp(keycloak) 與 oidc-client(gitea/argocd) 個別解決，oidc-idp 需要使用自建的 CA 憑證簽發特定網址的憑證，oidc-client 所在的 pod 啟動時自動存取 /etc/ssl/certs/下 root cert 或是執行特定的 script 將自建 CA 憑證匯入並執行 update-ca-certificates (更新根憑證功能與特定平台有關) 來更新，oidc-client 可能會支援用環境變數切換來取消自簽憑證的驗證，不過目前 gitea/argocd 還未支援，但是 grafana 有 tls_skip_verify_insecure 可用，參考 [OAuth authentication | Grafana Labs](https://grafana.com/docs/grafana/latest/auth/generic-oauth/)

目前測試 gitea/argocd 可用掛載 /etc/ssl/certs/xxx.crt 模式將自簽 CA 憑證置入容器內不需要用 script 複製執行程式模式，使用 script 作法受到權限控管限制很多，例如 argocd 需要自編譯 image 太過複雜。

## argocd

gitea 的 OIDC 只有認證即可建立帳號進入不分 role/group 等設定，argocd 可以對應 oidc scope groups 的對應關係來綁定 argocd 與 oidc idp 內授權群組關係，參照 [Keycloak - Argo CD - Declarative GitOps CD for Kubernetes](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/keycloak/) ，範例為 argocd 可對應 group ArgoCDAdmins 登入取得管理權限。

- keycloak argocd client
  - Client ID: argocd101
  - Root URL: https://argocd.127.0.0.1.nip.io:9443
  - Access Type: confidential
  - Valid Redirect URIs: https://argocd.127.0.0.1.nip.io:9443/*
  - Base URL: /applications
- argocd-cm/oidc.config
  - issuer: https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101


## grafana

keycloak grafana client
  - Client ID: grafana101
  - Root URL: https://grafana-istio-system.127.0.0.1.nip.io:9443
  - Access Type: confidential
  - Valid Redirect URIs: https://grafana-istio-system.127.0.0.1.nip.io:9443/*
  - Base URL: /
  - Create 3 Client Roles: Viewer, Editor, Admin
  - Client Mapper
    - type: User Client Role
    - Client ID: grafana101
    - Token Claim Name: roles
    - Claim JSON Type: string
    - Add to ID token: ON
    - Add to Access token: ON
    - Add to userinfo: ON
  - Client Scope - Evaluate - alice

ID_TOKEN, user alice with grafana101-client-role:Editor, oidc client grafana101

```json
{
  "exp": 1641277716,
  "iat": 1641277416,
  "auth_time": 0,
  "jti": "7b3c9d16-0332-488c-a9a1-ebb916c4e0c0",
  "iss": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101",
  "aud": "grafana101",
  "sub": "5cc6dca3-ea5a-444b-b239-dbc5a83df0d5",
  "typ": "ID",
  "azp": "grafana101",
  "session_state": "107ec23a-817d-4741-8829-ac7844819ad3",
  "acr": "1",
  "sid": "107ec23a-817d-4741-8829-ac7844819ad3",
  "email_verified": true,
  "roles": [
    "Editor"
  ],
  "preferred_username": "alice",
  "email": "alice101@dev.local"
}
```

grafana 提供單一值的 role 對應與陣列值對應，參考 [OAuth authentication | Grafana Labs](https://grafana.com/docs/grafana/latest/auth/generic-oauth/#jmespath-examples)

單一值對應與 keycloak role 多值陣列型不符，如須 mapper 對應單一值可以使用 user attribute 來對應輸出 role 值，只是這樣不方便管理找出現有的 role 關係。採用多值對應需要使用 JMESPath 語法來對應出 role。

```
role_attribute_path = contains(roles[*], 'Admin') && 'Admin' || contains(roles[*], 'Editor') && 'Editor' || 'Viewer'
```

# kiali oidc

TODO

[OpenID Connect strategy | Kiali](https://kiali.io/docs/configuration/authentication/openid/)

# istio and prometheus

[Istio / JWT Token](https://istio.io/latest/docs/tasks/security/authorization/authz-jwt/)

> The policy requires all requests to the httpbin workload to have a valid JWT with requestPrincipal set to testing@secure.istio.io/testing@secure.istio.io. Istio constructs the requestPrincipal by combining the iss and sub of the JWT token with a / separator 

keycloak 的 sub 是使用者的 ID 如 773e0ab7-9064-432e-9d59-9a510f0fadd2 而不是 Username 或 Email，另外效期為 300 秒需用完。

```json
{
  "exp": 1641361915,
  "iat": 1641361615,
  "auth_time": 0,
  "jti": "773e0ab7-9064-432e-9d59-9a510f0fadd2",
  "iss": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101",
  "aud": "gitea101",
  "sub": "5cc6dca3-ea5a-444b-b239-dbc5a83df0d5",
  "typ": "ID",
  "azp": "gitea101",
  "session_state": "efadf22c-8fe0-4982-a1ac-322faf99287d",
  "acr": "1",
  "sid": "efadf22c-8fe0-4982-a1ac-322faf99287d",
  "email_verified": true,
  "preferred_username": "alice",
  "email": "alice101@dev.local"
}
```

單一文件可以使用 curl 取得 id_token 轉 Authorization: Bearer TOKEN 取得，瀏覽器端如何應用？這時需要配置 oauth2-proxy 或是 authservice 來將 id_token 轉成 cookie 發送。

- [Istio External OIDC Authentication with OAuth2-Proxy | Medium](https://medium.com/@lucario/istio-external-oidc-authentication-with-oauth2-proxy-5de7cd00ef04)
- [Use Istio for authorisation: how to redirect to login page and how to use JWT cookies - Security - Discuss Istio](https://discuss.istio.io/t/use-istio-for-authorisation-how-to-redirect-to-login-page-and-how-to-use-jwt-cookies/9038/3)
- [Overview | OAuth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/docs/configuration/overview)
- [Istio / RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/)
- [Istio / Authorization Policy](https://istio.io/latest/docs/reference/config/security/authorization-policy/)
- [istio-ecosystem/authservice: Move OIDC token acquisition out of your app code and into the Istio mesh](https://github.com/istio-ecosystem/authservice)

原開始 istio-ecosystem/authservice 來做不過無法正常運作， 改成 oauth2-proxy 模式，istio 的 RequestAuthentication 與 AuthorizationPolicy 都是針對 workload 型別，不能應用在 istio CR gateway 上面，除非全面使用否則不適合作用在 matchLabels: app: istio-ingressgateway 上面，必須個別 workload 設定。

## keycloak client: oauth2-proxy101 設定

由於 oauth2-proxy 是共用 client 非專用，要注意將所有的 redirect_uri 列入，這裡需要列入下面連結，其他設定取一代表即可？

- https://my-nginx.127.0.0.1.nip.io:9443/*
- https://go-httpbin.127.0.0.1.nip.io:9443/*





## cookie 範圍與登出問題 

設定 ```cookie-domain=.127.0.0.1.nip.io``` 代表所有次網域的都會納入，所以登入 my-nginx 後可以直接進入 prometheus 不須在登入。只是登出要注意刪除 cookie 範圍，如果只刪單一網站因為 cookie-domain 設定會再填上一個新的，所以要刪 ```.127.0.0.1.nip.io``` 網域的 cookie 才有效用。

由於廣域 cookie 問題，使用 [Endpoints | OAuth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/docs/features/endpoints) 可能無法清除 cookie 後登出。另外設定 /oauth2/sign_out 無效原因待查。

- https://prometheus-istio-system.127.0.0.1.nip.io:9443/oauth2/sign_out?rd=https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101/protocol/openid-connect/logout
- https://my-nginx.127.0.0.1.nip.io:9443/oauth2/sign_out?rd=https://keycloak.127.0.0.1.nip.io:9443/auth/realms/pro101/protocol/openid-connect/logout


## kiali and prometheus (無關 OIDC)

原先安裝 prometheus/kiali 有 sidecar.istio.io/inject: "false" 防注標籤需要去除才能讓 authorization policy 生效。

kiali 需要存取 prometheus /api/v1/query 但是目前 CUSTOM 無法做 bypass。

```
[2022/01/07 00:02:48] [oauthproxy.go:866] No valid authentication in request. Initiating login.
[2022/01/07 00:02:48] [cookies.go:21] Warning: request host "prometheus.istio-system:9090" did not match any of the specific cookie domains of ".127.0.0.1.nip.io"
[2022/01/07 00:02:48] [cookies.go:84] Warning: request host is "prometheus.istio-system" but using configured cookie domain of ".127.0.0.1.nip.io"
127.0.0.6:47173 - 3326b410-3148-4c2c-b528-6ebbceae2945 - - [2022/01/07 00:02:48] prometheus.istio-system:9090 POST - "/api/v1/query" HTTP/1.1 "" 302 0 0.000
```

kiali 內部存取 prometheus 不須授權需要除外設定，目前無法使用 ```invalid policy prometheus.istio-system: From.NotNamespaces is currently not supported with CUSTOM action``` 從 meshconfig/envoyExtAuthzHttp 也沒有相關設定可以放行特定來源。

[Istio / Authorization Policy](https://istio.io/latest/docs/reference/config/security/authorization-policy/#Operation)

>  When used together, A request is allowed if and only if all the actions return allow, in other words, the extension cannot bypass the authorization decision made by ALLOW and DENY action. Extension behavior is defined by the named providers declared in MeshConfig. The authorization policy refers to the extension by specifying the name of the provider. One example use case of the extension is to integrate with a custom external authorization system to delegate the authorization decision to it.

[envoyExtAuthzHttp a.k.a MeshConfig.ExtensionProvider.EnvoyExternalAuthorizationHttpProvider](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-EnvoyExternalAuthorizationHttpProvider)

因應 rest api 類型非 cookie authz 需從 oauth2-proxy 的 skip-auth-route 修改，因為這類 api client 很多沒有設定 cookie 的機制非 oauth2-proxy 的 authz 對象，應該另外配合來做 api 型的 authz 政策。

## kiali: Error loading Graph (from prometheus)

kiali 不單是走 prometheus /api/v1 似乎還會走 / 根目錄會導致無法開放，無法使用 oauth2-proxy 的 skip-auth-route 避開故移除不支援瀏覽器端瀏覽 prometheus，也就與 OIDC 無關。

kiail log

```
2022-01-07T06:06:10Z ERR Error while fetching app health: client_error: client error: 403
```

oauth2-proxy log

```
[2022/01/07 06:14:57] [cookies.go:21] Warning: request host "prometheus.istio-system:9090" did not match any of the specific cookie domains of ".127.0.0.1.nip.io"
[2022/01/07 06:14:57] [cookies.go:84] Warning: request host is "prometheus.istio-system" but using configured cookie domain of ".127.0.0.1.nip.io"
[2022/01/07 06:14:57] [oauthproxy.go:866] No valid authentication in request. Initiating login.
[2022/01/07 06:14:57] [oauthproxy.go:866] No valid authentication in request. Initiating login.
127.0.0.6:34853 - 9896ab81-63e1-4a61-b56a-5e47e143afef - - [2022/01/07 06:14:57] prometheus.istio-system:9090 GET - "/" HTTP/1.1 "" 302 355 0.000
```

無法解決，另一個考慮是這樣大量進入 oauth2-proxy 是否適當？

# kubernetes OIDC

[Authenticating | Kubernetes](https://kubernetes.io/docs/reference/access-authn-authz/authentication/#openid-connect-tokens)

> To identify the user, the authenticator uses the id_token (not the access_token) from the OAuth2 token response as a bearer token. See above for how the token is included in a request.

第一個問題是如何取得 id_token，keycloak 界面是否可以直接登入取得 id_token ？ [security - Does Keycloak allow obtaining id tokens via web interface - Stack Overflow](https://stackoverflow.com/questions/54442786/does-keycloak-allow-obtaining-id-tokens-via-web-interface)


Keycloak - Clients - Client Scopes - Evaluate 可以模擬輸出特別使用者的 id_token 原始內容但不會是 JWT 封裝簽名格式，所以取得 id_token 還是只能從 token url 取得。

綁定 k8s api server 需要建立時傳入或是進去 master-node 改 /etc/kubernetes/manifests/kube-apiserver.yaml，目前配置 OIDC IDP 在 kubernetes cluster 之內，可能出現無法存取 OIDC IDP 服務的問題，所以這裡只留下紀錄並不做 kubernetes OIDC 配置。

[How to Secure Your Kubernetes Cluster with OpenID Connect and RBAC | Okta Developer](https://developer.okta.com/blog/2021/11/08/k8s-api-server-oidc)

```sh
k3d cluster create $CLUSTER_NAME \
--k3s-arg "--kube-apiserver-arg=oidc-issuer-url=<k8s_oidc_issuer_url>@server:0" \
--k3s-arg "--kube-apiserver-arg=oidc-client-id=<k8s_oidc_client_id>@server:0" \
--k3s-arg "--kube-apiserver-arg=oidc-username-claim=email@server:0" \
--k3s-arg "--kube-apiserver-arg=oidc-groups-claim=groups@server:0"
```

# coredns 設定跑掉

coredns 的 configmap 內有 node 節點資料，所以當 kubernetes cluster 重開或是新增刪除節點就會重新改寫過，導致目前必須手動執行 patch 來生效，後續版本可支援改寫保存。

```sh
just kpatch_dns_alias
```

- [feat: override CoreDNS config by chris13524 · Pull Request #4854 · k3s-io/k3s](https://github.com/k3s-io/k3s/pull/4854)
- [[Feature] Customizing CoreDNS ConfigMap with overrides and additional servers by iwilltry42 · Pull Request #4397 · k3s-io/k3s](https://github.com/k3s-io/k3s/pull/4397)
- [More extensibility to CoreDNS configmap · Issue #462 · k3s-io/k3s](https://github.com/k3s-io/k3s/issues/462)
- [How -To Make Persistent Changes in CoreDNS ConfigMap For PMK Cluster. - Platform9 Knowledge Base](https://platform9.com/kb/kubernetes/how-to-make-persistent-changes-in-coredns-configmap-for-pmk-clu)

# Role based access control for multiple Keycloak clients

keycloak 需另外作為才能作到在單一個 realm 下面將使用者分開給不同 client 權限，相較於 vault 可不同 oidc client 綁不同 group 不同，如使用 gitea/argocd/grafana 的使用者是同一群使用者就沒有差異，如果使用 gitea 與 argocd 的使用者需要權限隔離就須改成兩個 realm 來做，只是這樣就會出現如果是單一使用者跨兩邊 realm 都需要個別建立使用者。

- [Ability to set policies on who should be able to access a client · Issue #8783 · keycloak/keycloak](https://github.com/keycloak/keycloak/issues/8783)
- [[KEYCLOAK-10091] Ability to set policies on who should be able to access a client - Red Hat Issue Tracker](https://issues.redhat.com/browse/KEYCLOAK-10091)
- [Janik Vonrotz - Role based access control for multiple Keycloak clients](https://janikvonrotz.ch/2020/04/30/role-based-access-control-for-multiple-keycloak-clients/)
- [Allow users only for specific clients in a given realm - Getting advice - Keycloak](https://keycloak.discourse.group/t/allow-users-only-for-specific-clients-in-a-given-realm/2384/8)
- [sventorben/keycloak-restrict-client-auth: A Keycloak authenticator to restrict authorization on clients](https://github.com/sventorben/keycloak-restrict-client-auth)
- [single sign on - How can I restrict client access to only one group of users in keycloak? - Stack Overflow](https://stackoverflow.com/questions/54305880/how-can-i-restrict-client-access-to-only-one-group-of-users-in-keycloak)
- [ValentinChirikov/kc_user_role_validate_extension: KeyCloak user role validation extension](https://github.com/ValentinChirikov/kc_user_role_validate_extension)

## export realms

- [Server Administration Guide](https://www.keycloak.org/docs/latest/server_admin/index.html#assembly-exporting-importing_server_administration_guide)
- [jboss/keycloak - Docker Image | Docker Hub](https://hub.docker.com/r/jboss/keycloak/)

```
mkdir /tmp/export2201
cd /opt/jboss/keycloak/
bin/standalone.sh -Dkeycloak.migration.action=export \
 -Djboss.socket.binding.port-offset=100 \
 -Dkeycloak.migration.provider=dir \
 -Dkeycloak.migration.dir=/tmp/export2201
```

## Refs

- [helm-charts/charts/keycloak at master · codecentric/helm-charts](https://github.com/codecentric/helm-charts/tree/master/charts/keycloak)
- [KEYCLOAK-11775 Add the possibily to customize issuer uri by Angelinsky7 · Pull Request #6405 · keycloak/keycloak](https://github.com/keycloak/keycloak/pull/6405)