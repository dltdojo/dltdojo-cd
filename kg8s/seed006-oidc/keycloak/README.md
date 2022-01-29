# setup

keycloak 設定由管理界面完成，需建立一個 realm 來加入新增的 oidc client，一個 realm 對應一個 well-known/openid-configuration，下面有 foo realm 舉例，需設定「Frontend URL」綁定固定前端網址，下面 Frontend URL 為 ```https://keycloak.127.0.0.1.nip.io:9443/auth``` 

well-known endpoint

- oidc client (Relying Party, PR) 會連到 http://keycloak-http.keycloak.svc.cluster.local/auth/realms/foo/.well-known/openid-configuration
- 對外雖然 End User 可看到  https://keycloak.127.0.0.1.nip.io:9443/auth/realms/foo/.well-known/openid-configuration ，但目前配置 RP 與 IDP (Identity Provider) 在同一內網不能用這個設定 argocd/gitea (RP) 的 well-known endpoint
- keycloak 的 openid-configuration 會根據發出請求連結不同而異動，所以網外 End User 與內部 RP 取得 openid-configuration 的網址內容會出現差異。

剩下設定參照 [Keycloak - Argo CD - Declarative GitOps CD for Kubernetes](https://argo-cd.readthedocs.io/en/stable/operator-manual/user-management/keycloak/) 完成，因為 argocd 可以對應 group ArgoCDAdmins 登入。

- keycloak argocd client
  - Client ID: argocd101
  - Root URL: https://argocd.127.0.0.1.nip.io:9443
  - Access Type: confidential
  - Valid Redirect URIs: https://argocd.127.0.0.1.nip.io:9443/*
  - Base URL: /applications
- keycloak gitea client
  - Client ID: gitea101
  - Root URL: https://gitea.127.0.0.1.nip.io:9443
  - Access Type: confidential
  - Valid Redirect URIs: https://gitea.127.0.0.1.nip.io:9443/*
  - Base URL: /
- gitea auth provider
  - OpenID Discovery URL: http://keycloak-http.keycloak.svc.cluster.local/auth/realms/foo/.well-known/openid-configuration
- argocd-cm/oidc.config
  - issuer: http://keycloak-http.keycloak.svc.cluster.local/auth/realms/foo

# openid-configuration

keycloak openid-configuration 由 realm 控制，輸出行為與 vault 設定 issuer 不一樣，會隨著 client 存取而出現差異。

RP 設定的是內部 http://keycloak-http.keycloak.svc.cluster.local 的話，authorization_endpoint 無法讓 End-User 使用的問題與 vault 遇到類似。

```
$ curl -v http://keycloak-http.keycloak.svc.cluster.local/auth/realms/master/.well-known/openid-configuration | jq .

{
  "issuer": "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/master",
  "authorization_endpoint": "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/master/protocol/openid-connect/auth",
  "token_endpoint": "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/master/protocol/openid-connect/token",
  "introspection_endpoint": "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/master/protocol/openid-connect/token/introspect",
  "userinfo_endpoint": "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/master/protocol/openid-connect/userinfo",

$ curl -ks https://keycloak.127.0.0.1.nip.io:9443/auth/realms/master/.well-known/openid-configuration | jq .

{
  "issuer": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/master",
  "authorization_endpoint": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/master/protocol/openid-connect/auth",
  "token_endpoint": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/master/protocol/openid-connect/token",
  "introspection_endpoint": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/master/protocol/openid-connect/token/introspect",
  "userinfo_endpoint": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/master/protocol/openid-connect/userinfo",
```

[Use of the public hostname | Server Installation and Configuration Guide](https://www.keycloak.org/docs/latest/server_installation/index.html#_hostname) 就是在說明這個很多設定如 gitea 或是 argocd 都只讀取 well-known/openid-configuration，而這個檔內含可能兩種不同的網址。

> This is reflected in the OpenID Connect Discovery endpoint for example where the authorization_endpoint uses the frontend URL, while token_endpoint uses the backend URL. As a note here a public client for instance would contact Keycloak through the public endpoint, which would result in the base of authorization_endpoint and token_endpoint being the same.

在 Realm 有個 「Frontend URL」就是做這個固定前端網址設定，新增一個 foo realm 後設定為 ```https://keycloak.127.0.0.1.nip.io:9443/auth``` ，注意要加上 /auth，設定完成測試內部模擬 backend client 存取如下

```sh
$ curl -s http://keycloak-http.keycloak.svc.cluster.local/auth/realms/foo/.well-known/openid-configuration | jq .
{
  "issuer": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/foo",
  "authorization_endpoint": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/foo/protocol/openid-connect/auth",
  "token_endpoint": "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/foo/protocol/openid-connect/token",
  "introspection_endpoint": "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/foo/protocol/openid-connect/token/introspect",
  "userinfo_endpoint": "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/foo/protocol/openid-connect/userinfo",
  "end_session_endpoint": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/foo/protocol/openid-connect/logout",
  "jwks_uri": "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/foo/protocol/openid-connect/certs",
  "check_session_iframe": "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/foo/protocol/openid-connect/login-status-iframe.html",
```

keycloak 除了 WebAuthn 支援之外，OIDC 應用場景方便，不須另外如 vault 方案使用 nginx 做 reverse proxy 版本的 well-known/openid-configuration


# Role based access control for multiple Keycloak clients

keycloak 需另外作為才能作到在單一個 realm 下面將使用者分開給不同 client 權限，相較於 vault 可不同 oidc client 綁不同 group 不同，如使用 gitea/argocd/grafana 的使用者是同一群使用者就沒有差異，如果使用 gitea 與 argocd 的使用者需要權限隔離就須改成兩個 realm 來做，只是這樣就會出現如果是單一使用者跨兩邊 realm 都需要個別建立使用者。

- [Ability to set policies on who should be able to access a client · Issue #8783 · keycloak/keycloak](https://github.com/keycloak/keycloak/issues/8783)
- [[KEYCLOAK-10091] Ability to set policies on who should be able to access a client - Red Hat Issue Tracker](https://issues.redhat.com/browse/KEYCLOAK-10091)
- [Janik Vonrotz - Role based access control for multiple Keycloak clients](https://janikvonrotz.ch/2020/04/30/role-based-access-control-for-multiple-keycloak-clients/)
- [Allow users only for specific clients in a given realm - Getting advice - Keycloak](https://keycloak.discourse.group/t/allow-users-only-for-specific-clients-in-a-given-realm/2384/8)
- [sventorben/keycloak-restrict-client-auth: A Keycloak authenticator to restrict authorization on clients](https://github.com/sventorben/keycloak-restrict-client-auth)
- [single sign on - How can I restrict client access to only one group of users in keycloak? - Stack Overflow](https://stackoverflow.com/questions/54305880/how-can-i-restrict-client-access-to-only-one-group-of-users-in-keycloak)
- [ValentinChirikov/kc_user_role_validate_extension: KeyCloak user role validation extension](https://github.com/ValentinChirikov/kc_user_role_validate_extension)

# oidc issuer match issue

> Failed to query provider "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/foo": oidc: issuer did not match the issuer returned by provider, expected "http://keycloak-http.keycloak.svc.cluster.local/auth/realms/foo" got "https://keycloak.127.0.0.1.nip.io:9443/auth/realms/foo"

結果還是遭遇 vault 問題，要 gitea/argocd 都支援另外用 reverse-proxy 來處理 well-known/openid-configuration 內 issuer 問題，不過 keycloak 似乎如 vault 有改寫 issuer 的作法，利用 oidc404 reverse proxy 方式設定後，gitea 登入出現 ```UserSignIn: oauth2: error validating JWT token: issuer in token does not match issuer in OpenIDConfig discovery``` 問題，所以除非找到 keycloak 支援 vault 設定 issuer 模式才能使用 reverse proxy 型態來轉接。

## Refs

- [helm-charts/charts/keycloak at master · codecentric/helm-charts](https://github.com/codecentric/helm-charts/tree/master/charts/keycloak)
- [KEYCLOAK-11775 Add the possibily to customize issuer uri by Angelinsky7 · Pull Request #6405 · keycloak/keycloak](https://github.com/keycloak/keycloak/pull/6405)