vault operator

```
vault operator init
vault operator unseal
vault login
```

[Mount Vault Secrets through Container Storage Interface (CSI) Volume | Vault - HashiCorp Learn](https://learn.hashicorp.com/tutorials/vault/kubernetes-secret-store-driver)

log

```
vault secrets enable -version=2 -path=secret101 kv
vault kv put secret101/db-pass password="db-secret-password"
vault auth enable kubernetes
vault write auth/kubernetes/config \
  issuer="https://kubernetes.default.svc.cluster.local" \
  token_reviewer_jwt="$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" \
  kubernetes_host="https://$KUBERNETES_PORT_443_TCP_ADDR:443" \
  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt

vault policy write internal-app - <<EOF
path "secret101/data/db-pass" {
    capabilities = ["read"]
}
EOF

vault write auth/kubernetes/role/database \
  bound_service_account_names=default \
  bound_service_account_namespaces=default \
  policies=internal-app \
  ttl=20m

```