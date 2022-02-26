# gitea ca certification problem

- add oidc conf from ui : OK
- add oidc conf from cli gitea : FAIL

牽涉到 ```export SSL_CERT_FILE=/etc/ssl/certs/my-ca-cert.crt``` 問題 [oAuth / openID with skip-tls-verify · Issue #16376 · go-gitea/gitea](https://github.com/go-gitea/gitea/issues/16376)。

```
2022/01/24 04:35:46 main.go:117:main() [F] Failed to run app with [gitea admin auth add-oauth --auto-discover-url https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101/.well-known/openid-configuration --key client101 --name keycloak2022 --provider openidConnect --secret 5PKq1iY17xDoDrKhx9M6p3nOrgrjqKbl]: Failed to initialize OpenID Connect Provider with name 'keycloak2022' with url 'https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101/.well-known/openid-configuration': Get "https://keycloak.127.0.0.1.sslip.io/auth/realms/blue101/.well-known/openid-configuration": x509: certificate signed by unknown authority
```