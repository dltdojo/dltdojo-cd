
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
