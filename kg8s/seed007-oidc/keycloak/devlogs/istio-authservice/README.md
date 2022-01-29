測試失敗有無效憑證問題與其他問題。

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

- [Use Istio for authorisation: how to redirect to login page and how to use JWT cookies - Security - Discuss Istio](https://discuss.istio.io/t/use-istio-for-authorisation-how-to-redirect-to-login-page-and-how-to-use-jwt-cookies/9038/3)
- [Overview | OAuth2 Proxy](https://oauth2-proxy.github.io/oauth2-proxy/docs/configuration/overview)
- [Istio / RequestAuthentication](https://istio.io/latest/docs/reference/config/security/request_authentication/)
- [Istio / Authorization Policy](https://istio.io/latest/docs/reference/config/security/authorization-policy/)
- [istio-ecosystem/authservice: Move OIDC token acquisition out of your app code and into the Istio mesh](https://github.com/istio-ecosystem/authservice)

這裡使用 istio-ecosystem/authservice 來做 oauth2-proxy 的工作。istio 的 RequestAuthentication 與 AuthorizationPolicy 都是針對 workload 型別，不能應用在 istio CR gateway 上面，除非全面使用否則不適合作用在 matchLabels: app: istio-ingressgateway 上面，必須個別 workload 設定。

[authservice/docs at master · istio-ecosystem/authservice](https://github.com/istio-ecosystem/authservice/tree/master/docs)

> Note: The Istio gateway's VirtualService must be prepared to ensure that this URL will get routed to the service so that the Authservice can intercept the request and handle it (see example). Required.

