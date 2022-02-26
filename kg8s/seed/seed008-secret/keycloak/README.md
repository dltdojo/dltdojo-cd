# setup

k8s 內如何實現 https://keycloak.127.0.0.1.sslip.io:443 轉到 https://keycloak-http.keycloak.svc.cluster.local:9443 有幾個地方要修改。

- coredns 對應 keycloak.127.0.0.1.sslip.io 到 keycloak-http.keycloak.svc.cluster.local 參考 [Custom DNS Entries For Kubernetes](https://coredns.io/2017/05/08/custom-dns-entries-for-kubernetes/)
- keycloak 使用 https svc port 必須與對外一致，原設定為 8443 需改為 9443 這樣 issuer 才會與對外的 authorization_endpoint 一致。
- oidc client 集中配置不分 gitea/argocd/grafana/kiali/oauth2-proxy，單一配置管理 oidc client 比較簡單，不提供個別設定會出現登入後都是進入 / 而不是登入服務後個別設定的路徑例如 argocd 登入後轉到 /applications，另一個單一配置缺點是 keycloak 的 session 看不出目前使用者在哪個 oidc client 也就無法針對特別服務登出或是尋找，只能一次全部終結 session。

## keycloak realm pro101

- https://keycloak.127.0.0.1.sslip.io:443
- realm : pro101
- oidc configuration : https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/.well-known/openid-configuration
- oidc issuer (只與 realm 有關，與個別 odic client 無關) : https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101

issuer 內容為 public_key 與對應網址，要取得 id_token 需要提供相關的登入資訊與 response_type=id_token 如下。

```
curl -sk https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101
{
  "realm": "pro101",
  "public_key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmd8hoYDmfOsHjuzPkMCO18R8gDH1j+8SyMsvN56yn2czTDRCI0gI7DXI+EMwGrAVAMD5P8nWEh7c4zP5u8duUkdHqLnur0G8EpYccTNCCJxanz0FWvgz4JyZnCnnZZ5BS8w+Ti6YPFvO/GKk4nQYeACCWb8IK81/jdrvGfhRs7Bib4JpwdBEnA0FFYuAOPplZEDyOuH0Ix8ekT7ETQ9z1lkwbuHti3JzLGLC8gT/xichUtrX6rCL3A90PUanEDSTAws05FvtCQdrP88TbOcyYxzGMJPyT4IFjW5x/XDTD6oyk5jSHF4AzS8KV9xgye3kjrzArzookHhr88u+fJTfOwIDAQAB",
  "token-service": "https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/protocol/openid-connect",
  "account-service": "https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/account",
  "tokens-not-before": 1641261693
}

# access_token and id_token
curl -sk -X POST https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/protocol/openid-connect/token  \
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

# keycloak oidc client101 

- Client ID: client101
- Root URL: null
- Access Type: confidential
- Valid Redirect URIs: 
  - https://gitea.127.0.0.1.sslip.io:443/*
  - https://argocd.127.0.0.1.sslip.io:443/*
  - https://grafana-istio-system.127.0.0.1.sslip.io:443/*
  - https://kiali-istio-system.127.0.0.1.sslip.io:443/*
  - https://my-nginx.127.0.0.1.sslip.io:443/*
  - https://httpbin.127.0.0.1.sslip.io:443/*
- Client Scopes
  - Default Client Scopes: groups [Keycloak - Argo CD - Declarative GitOps CD for Kubernetes](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/keycloak/)
  - Client Mapper
    - type: Group Membership
    - Token Claim Name: groups
    - Add to ID token: ON
    - Add to Access token: ON
    - Add to userinfo: ON
- Users
  - alice (alice@dev.local)
  - bob (bob@dev.local)
- Groups
  - grafana-viewer
  - grafana-editor
  - grafana-admin
  - httpbin-viewer
  - httpbin-editor
  - httpbin-admin

## gitea 

- gitea auth provider
  - client id: client101
  - OpenID Discovery URL: https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/.well-known/openid-configuration

開始測試會遭遇 oidc client(gitea/argocd) 不接受自簽憑證的問題。 

> Failed to initialize OpenID Connect Provider with name 'keycloak' with url 'https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/.well-known/openid-configuration': Get "https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/.well-known/openid-configuration": x509: certificate is not valid for any names, but wanted to match keycloak.127.0.0.1.sslip.io

- [Remove or provide a way to disable ssl validation on creation of OAuth2 provider · Issue #17867 · go-gitea/gitea](https://github.com/go-gitea/gitea/issues/17867)
- [Search · self-signed](https://github.com/go-gitea/gitea/search?q=self-signed&type=issues)
- [Received cert error when configuring AroCD SSO to use OIDC with self signed certificate · Issue #4344 · argoproj/argo-cd](https://github.com/argoproj/argo-cd/issues/4344)

這問題需在 oidc-idp(keycloak) 與 oidc-client(gitea/argocd) 個別解決，oidc-idp 需要使用自建的 CA 憑證簽發特定網址的憑證，oidc-client 所在的 pod 啟動時自動存取 /etc/ssl/certs/下 root cert 或是執行特定的 script 將自建 CA 憑證匯入並執行 update-ca-certificates (更新根憑證功能與特定平台有關) 來更新，oidc-client 可能會支援用環境變數切換來取消自簽憑證的驗證，不過目前 gitea/argocd 還未支援，但是 grafana 有 tls_skip_verify_insecure 可用，參考 [OAuth authentication | Grafana Labs](https://grafana.com/docs/grafana/latest/auth/generic-oauth/)

目前測試 gitea/argocd 可用掛載 /etc/ssl/certs/xxx.crt 模式將自簽 CA 憑證置入容器內不需要用 script 複製執行程式模式，使用 script 作法受到權限控管限制很多，例如 argocd 需要自編譯 image 太過複雜。

## argocd

gitea 的 OIDC 只有認證即可建立帳號進入不分 role/group 等設定，argocd 可以對應 oidc scope groups 的對應關係來綁定 argocd 與 oidc idp 內授權群組關係，參照 [Keycloak - Argo CD - Declarative GitOps CD for Kubernetes](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/keycloak/) ，範例為 argocd 可對應 group ArgoCDAdmins 登入取得管理權限。

- argocd-cm/oidc.config
  - issuer: https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101

## grafana

grafana 對應使用 role

ID_TOKEN, user alice with client role GrafanaEditor

```json
{
  "exp": 1641277716,
  "iat": 1641277416,
  "auth_time": 0,
  "jti": "7b3c9d16-0332-488c-a9a1-ebb916c4e0c0",
  "iss": "https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101",
  "aud": "grafana101",
  "sub": "5cc6dca3-ea5a-444b-b239-dbc5a83df0d5",
  "typ": "ID",
  "azp": "grafana101",
  "session_state": "107ec23a-817d-4741-8829-ac7844819ad3",
  "acr": "1",
  "sid": "107ec23a-817d-4741-8829-ac7844819ad3",
  "email_verified": true,
  "roles": [
    "GrafanaEditor"
  ],
  "preferred_username": "alice",
  "email": "alice101@dev.local"
}
```

grafana 提供單一值的 role 對應與陣列值對應，參考 [OAuth authentication | Grafana Labs](https://grafana.com/docs/grafana/latest/auth/generic-oauth/#jmespath-examples)

單一值對應與 keycloak role 多值陣列型不符，如須 mapper 對應單一值可以使用 user attribute 來對應輸出 role 值，只是這樣不方便管理找出現有的 role 關係。採用多值對應需要使用 JMESPath 語法來對應出 role。

isto-metrics/patch-grafana-oidc.yaml

```
role_attribute_path = contains(roles[*], 'GrafanaAdmin') && 'Admin' || contains(roles[*], 'GrafanaEditor') && 'Editor' || 'Viewer'
```

另外注意 grafana.yaml 預設有 env GF_AUTH_ANONYMOUS_ENABLED=true 會導致寫入 grafana.ini 設定檔失效，不過一綁定 GF_AUTH_ANONYMOUS_ENABLED=true 就會完全無法看到頁面，必須 OIDC 設定完成。

# kiali

[OpenID Connect strategy | Kiali](https://kiali.io/docs/configuration/authentication/openid/)

kiali 的 RBAC 綁定在 kubernetes 不是 OIDC 的 token 內 roles 或是 groups，所以只要是 realm 下的所有登入使用者都可以使用 kiali 無法分群，除非綁定 kubernetes+OIDC，或是另外建立一個 keycloak realm 專門給無法分群的管理權限使用。

> The first option is preferred if you can manipulate your cluster API server startup flags, which will result in your cluster to also be integrated with the external OpenID provider.

kiali 提供轉接 oauth2-proxy 注入 Authorization header 模式也是綁定 kubernetes 定義模式，參考 [Header strategy | Kiali](https://kiali.io/docs/configuration/authentication/header/)

從前端可以發現 kiali 的 api 形式與 kubernetes 類似，所以可以用 opa 模式管控，目前未支援多 CUSTOM authz 模式還無法同時串連 oauth2-proxy + opa。oauth2-proxy 提供登入後 cookie 轉 Authorization header 功能，這個 opa 無法提供，也許有機會 oauth2-proxy 與 opa 整合在一起。

- https://kiali-istio-system.127.0.0.1.sslip.io:443/kiali/api/namespaces/istio-system/istio/authorizationpolicies/prometheus-kiali-allow
- https://kiali-istio-system.127.0.0.1.sslip.io:443/kiali/api/namespaces/istio-system/workloads/grafana
- [Unable to get two CUSTOM AuthorizationPolicies for the same workload · Issue #34041 · istio/istio](https://github.com/istio/istio/issues/34041)
- [Support for multiple CUSTOM AuthorizationPolicies · Issue #35758 · istio/istio](https://github.com/istio/istio/issues/35758)

一種可行作法是在專門登入網頁轉 oauth2-proxy 注入 cookie 後，利用跨 cookie domain 注入需要驗證的網頁，再利用 opa 類似 ``` [_, encoded] := split(http_request.headers.cookie, " ")```  模式取出 token，這樣也不需要 cookie 轉寫 Authorization header 功能。

- https://github.com/open-policy-agent/opa-envoy-plugin/blob/8b232874cbc5c60c6194aebda836fce49b05de4d/examples/istio/quick_start.yaml#L423
- [[RFC] Add Open Policy Agent based authorization to the Nginx auth request endpoint by herbrechtsmeier · Pull Request #1237 · oauth2-proxy/oauth2-proxy](https://github.com/oauth2-proxy/oauth2-proxy/pull/1237)
- [How to rewrite cookie to header in Istio? - Stack Overflow](https://stackoverflow.com/questions/48258856/how-to-rewrite-cookie-to-header-in-istio)
- [Open Policy Agent | Tutorial: Istio](https://www.openpolicyagent.org/docs/latest/envoy-tutorial-istio/)
- [open-policy-agent/opa-envoy-plugin: A plugin to enforce OPA policies with Envoy](https://github.com/open-policy-agent/opa-envoy-plugin)


# oauth2-proxy

oauth2-proxy 使用 istio CUSTOM authz 綁定可以限定 keycloak realm/client role 存取，必須將 Audience 置入 client101。

- [OAuth Provider Configuration | OAuth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/docs/configuration/oauth_provider#keycloak-oidc-auth-provider)
- Create a mapper with Mapper Type 'Group Membership' and Token Claim Name 'groups'.
- Create a mapper with Mapper Type 'Audience' and Included Client Audience and Included Custom Audience set to your client name.

其他

- [Authorization Bearer header does not get passed · Issue #1034 · oauth2-proxy/oauth2-proxy](https://github.com/oauth2-proxy/oauth2-proxy/issues/1034)
- [oauth2-proxy/auth.md at e6223383e5ff68709afe8e47d3e91b499e5802ad · pb82/oauth2-proxy](https://github.com/pb82/oauth2-proxy/blob/e6223383e5ff68709afe8e47d3e91b499e5802ad/docs/docs/configuration/auth.md#keycloak-oidc-auth-provider)


istio RequestAuthentication jwks url遇到下列自簽憑證問題。

```
2022-01-11T05:56:41.977333Z	warn	model	Failed to GET from "https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/protocol/openid-connect/certs": Get "https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/protocol/openid-connect/certs": x509: certificate signed by unknown authority.
```

- [Istio-ingressgateway with RequestAuthentication applied segfaults in Envoy if JWKS fails to return a valid payload · Issue #29212 · istio/istio](https://github.com/istio/istio/issues/29212)
- [How to set a private CA certificate in istiod? · Issue #29366 · istio/istio](https://github.com/istio/istio/issues/29366)


關鍵除錯 [Istio / Security Problems](https://istio.io/latest/docs/ops/common-problems/security-issues/#authorization-is-too-restrictive-or-permissive)

```
istioctl proxy-config log deploy/httpbin --level "rbac:debug" -n default
istioctl proxy-config log deploy/httpbin --level "jwt:debug" -n default
```

[Request denied with RequestAuthentication and an unknown jwt token and an allowing AuthorizationPolicy · Issue #24371 · istio/istio](https://github.com/istio/istio/issues/24371)


istio/authn 與 oauth2-proxy 目前無法並存，需要轉發 header 供後端 istio/authz 過濾，oauth2-proxy 轉發的 header 如下。

oauth2-proxy --provider=keycloka-oidc 會納入 role 等進入 X-Auth-Request-Groups

```
"X-Auth-Request-Email": "bob101@dev.local",
"X-Auth-Request-Groups": "httpbin-admin,httpbin-user,role:default-roles-pro101,role:account:manage-account,role:account:manage-account-links,role:account:view-profile",
"X-Auth-Request-Preferred-Username": "bob",
"X-Auth-Request-User": "84f13819-8224-4e37-b237-11fd8963cc1f",
```

oauth2-proxy --provider=oidc 只會納入 id_token groups 進入 X-Auth-Request-Groups

```
"X-Auth-Request-Groups": "httpbin-admin,httpbin-user",
```

keycloak 有很多預設的 role 需要除去與上述輸出才能應用到 istio/authz/when 的 request.headers[x-auth-request-groups] 授權過濾，所以要避開使用 --provider=keycloak-oidc 

目前比對 request.header 只有支援前後*作法，限制很大，例如限制上述的 ```*httpbin-user*``` 並不支援，只能 ```httpbin-user*``` 與 ```*httpbin-user``` 很明顯使用者只能加入單一群組模式。

- [Support for regex in paths in an AuthorizationPolicy · Issue #25021 · istio/istio](https://github.com/istio/istio/issues/25021)
 
如過要支持多群組必須全部納入可能性，而且排列順序一致。

```
      when:
        - key: request.headers[x-auth-request-groups]
          notValues: 
           - httpbin-user
           - dev-101,httpbin-user
           - dev-102,httpbin-user
           - prod-101,httpbin-user
```

另一種方式是 jwt 轉給 opa 做決定，問題是目前 istio 不支援多 CUSTOM Authz 設定，需用 EnvoyFilter 來注入做 RBAC 的確認。

- [opa-envoy-plugin/quick_start.yaml at main · open-policy-agent/opa-envoy-plugin](https://github.com/open-policy-agent/opa-envoy-plugin/blob/main/examples/istio/quick_start.yaml)
- [Istio / Envoy Filter](https://istio.io/latest/docs/reference/config/networking/envoy-filter/)
- [Open Policy Agent | Tutorial: Istio](https://www.openpolicyagent.org/docs/latest/envoy-tutorial-istio/)
- [Istio / Better External Authorization](https://istio.io/latest/blog/2021/better-external-authz/)


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
  "iss": "https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101",
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

## prometheus authz CUSTOM oauth2-proxy issue: kiali Error loading Graph

kiali 不單是走 prometheus /api/v1 似乎還會走 / 根目錄會導致無法開放，無法使用 oauth2-proxy 的 skip-auth-route 避開故移除不支援瀏覽器端瀏覽 prometheus，也就與 OIDC 無關。

kiail log

```
2022-01-07T06:06:10Z ERR Error while fetching app health: client_error: client error: 403
```

oauth2-proxy log

```
[2022/01/07 06:14:57] [cookies.go:21] Warning: request host "prometheus.istio-system:9090" did not match any of the specific cookie domains of ".127.0.0.1.sslip.io"
[2022/01/07 06:14:57] [cookies.go:84] Warning: request host is "prometheus.istio-system" but using configured cookie domain of ".127.0.0.1.sslip.io"
[2022/01/07 06:14:57] [oauthproxy.go:866] No valid authentication in request. Initiating login.
[2022/01/07 06:14:57] [oauthproxy.go:866] No valid authentication in request. Initiating login.
127.0.0.6:34853 - 9896ab81-63e1-4a61-b56a-5e47e143afef - - [2022/01/07 06:14:57] prometheus.istio-system:9090 GET - "/" HTTP/1.1 "" 302 355 0.000
```

無法解決，另一個考慮是這樣大量進入 oauth2-proxy 是否適當？

## cookie 範圍與登出問題 

設定 ```cookie-domain=.127.0.0.1.sslip.io``` 代表所有次網域的都會納入，所以登入 my-nginx 後可以直接進入 prometheus 不須在登入。只是登出要注意刪除 cookie 範圍，如果只刪單一網站因為 cookie-domain 設定會再填上一個新的，所以要刪 ```.127.0.0.1.sslip.io``` 網域的 cookie 才有效用。

由於廣域 cookie 問題，使用 [Endpoints | OAuth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/docs/features/endpoints) 可能無法清除 cookie 後登出。另外設定 /oauth2/sign_out 無效原因待查。

- https://prometheus-istio-system.127.0.0.1.sslip.io:443/oauth2/sign_out?rd=https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/protocol/openid-connect/logout
- https://my-nginx.127.0.0.1.sslip.io:443/oauth2/sign_out?rd=https://keycloak.127.0.0.1.sslip.io:443/auth/realms/pro101/protocol/openid-connect/logout


## kiali and prometheus (無關 OIDC)

原先安裝 prometheus/kiali 有 sidecar.istio.io/inject: "false" 防注標籤需要去除才能讓 authorization policy 生效。

kiali 需要存取 prometheus /api/v1/query 但是目前 CUSTOM 無法做 bypass。

```
[2022/01/07 00:02:48] [oauthproxy.go:866] No valid authentication in request. Initiating login.
[2022/01/07 00:02:48] [cookies.go:21] Warning: request host "prometheus.istio-system:9090" did not match any of the specific cookie domains of ".127.0.0.1.sslip.io"
[2022/01/07 00:02:48] [cookies.go:84] Warning: request host is "prometheus.istio-system" but using configured cookie domain of ".127.0.0.1.sslip.io"
127.0.0.6:47173 - 3326b410-3148-4c2c-b528-6ebbceae2945 - - [2022/01/07 00:02:48] prometheus.istio-system:9090 POST - "/api/v1/query" HTTP/1.1 "" 302 0 0.000
```

kiali 內部存取 prometheus 不須授權需要除外設定，目前無法使用 ```invalid policy prometheus.istio-system: From.NotNamespaces is currently not supported with CUSTOM action``` 從 meshconfig/envoyExtAuthzHttp 也沒有相關設定可以放行特定來源。

[Istio / Authorization Policy](https://istio.io/latest/docs/reference/config/security/authorization-policy/#Operation)

>  When used together, A request is allowed if and only if all the actions return allow, in other words, the extension cannot bypass the authorization decision made by ALLOW and DENY action. Extension behavior is defined by the named providers declared in MeshConfig. The authorization policy refers to the extension by specifying the name of the provider. One example use case of the extension is to integrate with a custom external authorization system to delegate the authorization decision to it.

[envoyExtAuthzHttp a.k.a MeshConfig.ExtensionProvider.EnvoyExternalAuthorizationHttpProvider](https://istio.io/latest/docs/reference/config/istio.mesh.v1alpha1/#MeshConfig-ExtensionProvider-EnvoyExternalAuthorizationHttpProvider)

因應 rest api 類型非 cookie authz 需從 oauth2-proxy 的 skip-auth-route 修改，因為這類 api client 很多沒有設定 cookie 的機制非 oauth2-proxy 的 authz 對象，應該另外配合來做 api 型的 authz 政策。

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
just kpatch_coredns_rewrite
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